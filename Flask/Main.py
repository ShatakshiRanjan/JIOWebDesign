from flask import Flask, render_template, request, redirect, url_for, session, jsonify, send_from_directory, Blueprint
from flask import current_app as app
from flask_mysqldb import MySQL
import MySQLdb.cursors
import hashlib
import os
from datetime import timedelta
from apscheduler.schedulers.background import BackgroundScheduler
import config

activePages = Blueprint('activePages', __name__)

app = Flask(__name__)

app.secret_key = 'your secret key'
app.config['MYSQL_HOST'] = config.MYSQL_HOST
app.config['MYSQL_USER'] = config.MYSQL_USER
app.config['MYSQL_PASSWORD'] = config.MYSQL_PASSWORD
app.config['MYSQL_DB'] = config.MYSQL_DB

mysql = MySQL(app)

frontPages = Blueprint('frontPages', __name__)

@app.before_first_request
def logout():
    session.clear()

@frontPages.route("/register", methods=["GET", "POST"])
def register():
    if 'user_id' in session:
        session.clear()
    if request.method == "POST":
        email = request.form.get("email")
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        password = request.form.get("password")
        password2 = request.form.get("password2")

        if password != password2:
            return render_template("register.html", error="Passwords do not match")

        hashed_password = hashlib.sha256(password.encode()).hexdigest()

        cursor = mysql.connection.cursor()
        cursor.execute("INSERT INTO users (email, first_name, last_name, passw) VALUES (%s, %s, %s, %s)",
                       (email, first_name, last_name, hashed_password))
        mysql.connection.commit()
        cursor.close()

        return redirect(url_for("frontPages.login"))
    return render_template("register.html")

@frontPages.route("/login", methods=["GET", "POST"])
def login():
    if 'user_id' in session:
        session.clear()
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()

        if not user:
            return render_template("login.html", error="Incorrect username or password")

        if user['passw'] == hashed_password:
            session["user_id"] = user['id']
            session.permanent = True
            app.permanent_session_lifetime = timedelta(minutes=20)
            scheduler.add_job(archieve_posts, trigger="interval", hours=1)
            return redirect(url_for("activePages.nextpage"))
        else:
            return render_template("login.html", error="Incorrect username or password")

    return render_template("login.html")


@frontPages.route('/')
def home():
    if 'user_id' in session:
        session.clear()
    Background = os.path.join(os.path.join("static", "Images"), "background_1.jpg")
    return render_template('index.html', user_image=Background)

app.register_blueprint(frontPages)

def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static', 'Images'), 'favicon.ico')

scheduler = BackgroundScheduler()

def remove_old_completed_tasks():
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM tasks WHERE completed = TRUE AND completion_date < NOW() - INTERVAL 1 DAY")
    mysql.connection.commit()
    cursor.close()

scheduler.add_job(func=remove_old_completed_tasks, trigger="interval", days=1)
scheduler.start()


def archieve_posts():
    with app.app_context():
        cursor = mysql.connection.cursor()
        cursor.execute("""INSERT INTO archieved_posts (post_id, user_id, title, body, created_at)
                          SELECT id, user_id, title, body, created_at FROM posts
                          WHERE TIMESTAMPDIFF(HOUR, created_at, NOW()) > 1;""")
        cursor.execute("""UPDATE comments, archieved_posts, posts
                            SET comments.post_id = NULL, comments.archieved = 1, comments.archieved_id = archieved_posts.id 
                            WHERE posts.id = archieved_posts.post_id;""")
        cursor.execute("""DELETE FROM posts
                          WHERE TIMESTAMPDIFF(HOUR, created_at, NOW()) > 1;""")
        mysql.connection.commit()
        cursor.close()
        print("Posts archived")




@activePages.before_request
def update_session():
    if not session.get('user_id'):
        return redirect(url_for('logout'))
    else:
        session.modified = True

@activePages.route('/dashboard')
def nextpage():
    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for('logout'))

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    # Fetch user first name
    cursor.execute("SELECT first_name FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    first_name = user['first_name'] if user else None

    # Fetch tasks assigned to the user
    cursor.execute("""
        SELECT tasks.TID, tasks.task, tasks.type, tasks.dateOfTaskStart, tasks.timeOfTaskStart, tasks.dateOfTaskEnd, tasks.timeOfTaskEnd,
            tasks.dueDate, tasks.dueTime, tasks.descript, projects.name as project_name,
            GROUP_CONCAT(CONCAT(users.first_name, ' ', users.last_name) SEPARATOR ', ') AS assigned_users
        FROM tasks
        JOIN task_assignments ON tasks.TID = task_assignments.task_id
        JOIN users ON task_assignments.user_id = users.id
        JOIN projects ON tasks.project_id = projects.id
        WHERE tasks.completed = FALSE AND tasks.TID IN (
            SELECT task_id FROM task_assignments WHERE user_id = %s
        )
        GROUP BY tasks.TID
    """, (user_id,))
    tasks = cursor.fetchall()

    # Fetch all projects
    cursor.execute("SELECT id, name FROM projects")
    projects = cursor.fetchall()

    cursor.close()

    # Convert tasks into the format expected by the calendar script
    events = []
    for task in tasks:
        if task['type'] == 'task':
            start_date = task['dateOfTaskStart']
            events.append({
                'eventName': task['task'],
                'calendar': task['project_name'],
                'date': start_date.isoformat() if start_date else None,
                'color': 'orange'  # Customize color as needed
            })
        elif task['type'] == 'event':
            due_date = task['dueDate']
            events.append({
                'eventName': task['task'],
                'calendar': task['project_name'],
                'date': due_date.isoformat() if due_date else None,
                'color': 'blue'  # Customize color as needed
            })

    if first_name:
        return render_template('dashboard.html', first_name=first_name, events=events, tasks=tasks, projects=projects)

    return redirect(url_for('login'))

@app.route('/delete_project', methods=['POST'])
def delete_project():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"success": False, "message": "User not authenticated"})

    data = request.get_json()
    project_id = data.get('project_id')

    if not project_id:
        return jsonify({"success": False, "message": "Invalid project ID"})

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

    try:
        # Delete all tasks and events associated with the project
        cursor.execute("DELETE FROM task_assignments WHERE task_id IN (SELECT TID FROM tasks WHERE project_id = %s)", (project_id,))
        cursor.execute("DELETE FROM tasks WHERE project_id = %s", (project_id,))
        # Delete the project itself
        cursor.execute("DELETE FROM projects WHERE id = %s", (project_id,))
        mysql.connection.commit()
        cursor.close()
        return jsonify({"success": True})
    except Exception as e:
        mysql.connection.rollback()
        cursor.close()
        return jsonify({"success": False, "message": str(e)})


@activePages.route('/task')
def task():
    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for('logout'))
        return jsonify(success=False, message="User not logged in"), 401

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT id, first_name, last_name FROM users")
    users = cursor.fetchall()
    
    cursor.execute("SELECT id, name FROM projects")
    projects = cursor.fetchall()
    
    cursor.close()
    return render_template('htmltask.html', users=users, projects=projects)

@activePages.route('/submit_task', methods=['POST'])
def submit_task():
    task_type = request.form['type']
    user_id = session.get("user_id")
    if not user_id:
        return jsonify(success=False, message="User not logged in"), 401

    if task_type == 'project':
        project_name = request.form['name']
        project_description = request.form['description']
        
        sql_project = """
            INSERT INTO projects (name, description, user_id)
            VALUES (%s, %s, %s)
        """
        cursor = mysql.connection.cursor()
        cursor.execute(sql_project, (project_name, project_description, user_id))
        mysql.connection.commit()
        cursor.close()
        
        return redirect(url_for('activePages.task'))

    # Handle task or event creation
    task_name = request.form['name']
    description = request.form['description']
    project_id = request.form['project_id']
    assigned_to = request.form.getlist('assignedTo[]')
    
    if task_type == 'task':
        start_date = request.form.get('startDate') or None
        start_time = request.form.get('startTime') or None
        end_date = request.form.get('endDate') or None
        end_time = request.form.get('endTime') or None
        
        sql_task = """
            INSERT INTO tasks (task, type, dateOfTaskStart, timeOfTaskStart, dateOfTaskEnd, timeOfTaskEnd, descript, user_id, project_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        val_task = (task_name, task_type, start_date, start_time, end_date, end_time, description, user_id, project_id)
    
    elif task_type == 'event':
        due_date = request.form.get('date') or None
        due_time = request.form.get('time') or None
        
        sql_task = """
            INSERT INTO tasks (task, type, dueDate, dueTime, descript, user_id, project_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        val_task = (task_name, task_type, due_date, due_time, description, user_id, project_id)
    
    cursor = mysql.connection.cursor()
    cursor.execute(sql_task, val_task)
    task_id = cursor.lastrowid

    sql_assignment = "INSERT INTO task_assignments (task_id, user_id) VALUES (%s, %s)"
    for user_id in assigned_to:
        cursor.execute(sql_assignment, (task_id, user_id))

    mysql.connection.commit()
    cursor.close()

    return redirect(url_for('task'))

@activePages.route('/delete_task', methods=['POST'])
def delete_task():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify(success=False, message="User not logged in"), 401

    task_id = request.json.get('task_id')
    if not task_id:
        return jsonify(success=False, message="Task ID not provided"), 400

    try:
        cursor = mysql.connection.cursor()
        cursor.execute("DELETE FROM task_assignments WHERE task_id = %s", (task_id,))
        cursor.execute("DELETE FROM tasks WHERE TID = %s", (task_id,))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify(success=True)
    except Exception as e:
        mysql.connection.rollback()
        print(f"Error deleting task: {e}")
        return jsonify(success=False, message="Database error"), 500

@activePages.route('/complete_task', methods=['POST'])
def complete_task():
    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for('login'))

    task_id = request.json.get('task_id')  
    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE tasks SET completed = TRUE, completion_date = NOW() WHERE TID = %s", (task_id,))
    mysql.connection.commit()
    cursor.close()
    
    return jsonify(success=True)

@activePages.route('/completed_tasks')
def completed_tasks():
    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for('login'))

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("""
        SELECT tasks.TID, tasks.task, tasks.type, tasks.dateOfTaskStart, tasks.timeOfTaskStart, tasks.dateOfTaskEnd, tasks.timeOfTaskEnd,
               tasks.dueDate, tasks.dueTime, tasks.descript, tasks.completion_date, projects.name as project_name,
               GROUP_CONCAT(CONCAT(users.first_name, ' ', users.last_name) SEPARATOR ', ') AS assigned_users
        FROM tasks
        JOIN task_assignments ON tasks.TID = task_assignments.task_id
        JOIN users ON task_assignments.user_id = users.id
        JOIN projects ON tasks.project_id = projects.id
        WHERE tasks.completed = TRUE AND tasks.TID IN (
            SELECT task_id FROM task_assignments WHERE user_id = %s
        )
        GROUP BY tasks.TID
    """, (user_id,))
    tasks = cursor.fetchall()
    cursor.close()
    
    return render_template('completed_tasks.html', tasks=tasks)

@activePages.route('/mark_incomplete', methods=['POST'])
def mark_incomplete():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({'success': False, 'message': 'User not logged in'}), 401

    task_id = request.json.get('task_id')
    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE tasks SET completed = FALSE, completion_date = NULL WHERE TID = %s", (task_id,))
    mysql.connection.commit()
    cursor.close()

    return jsonify({'success': True}), 200

@activePages.route('/delete_post', methods=['POST'])
def delete_post():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify(success=False, message="User not logged in"), 401

    post_id = request.json.get('post_id')
    if not post_id:
        return jsonify(success=False, message="Post ID not provided"), 400

    try:
        cursor = mysql.connection.cursor()
        cursor.execute("DELETE FROM comments WHERE post_id = %s", (post_id,))
        cursor.execute("DELETE FROM posts WHERE id = %s", (post_id,))
        mysql.connection.commit()
        cursor.close()
        
        return jsonify(success=True)
    except Exception as e:
        mysql.connection.rollback()
        print(f"Error deleting post: {e}")
        return jsonify(success=False, message="Database error"), 500

@activePages.route('/discussion_board', methods=['GET', 'POST'])
def discussion_board():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("""
        SELECT posts.id, posts.title, posts.body, posts.created_at, users.first_name, users.last_name 
        FROM posts
        JOIN users ON posts.user_id = users.id
        ORDER BY posts.created_at DESC
    """)
    posts = cursor.fetchall()
    cursor.close()
    if request.method == 'POST':
        title = request.form.get('title')
        body = request.form.get('body')
        user_id = session.get('user_id')

        cursor = mysql.connection.cursor()
        cursor.execute("INSERT INTO posts (user_id, title, body) VALUES (%s, %s, %s)", (user_id, title, body))
        mysql.connection.commit()
        cursor.close()
        return redirect(url_for('activePages.discussion_board'))
    return render_template('CommunityChat.html', posts=posts)

@activePages.route('/archieved_posts', methods=['GET', 'POST'])
def archieved_posts():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("""
        SELECT archieved_posts.id, archieved_posts.title, archieved_posts.body, archieved_posts.created_at, users.first_name, users.last_name 
        FROM archieved_posts
        JOIN users ON archieved_posts.user_id = users.id
        ORDER BY archieved_posts.created_at DESC
    """)
    archieved_posts = cursor.fetchall()
    cursor.close()
    return render_template('ArchievedChat.html', archieved_post=archieved_posts)

@activePages.route('/archieved_post/<int:archieved_id>', methods=['GET', 'POST'])
def archieved_post(archieved_id):

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("""
        SELECT archieved_posts.*, users.first_name, users.last_name 
        FROM archieved_posts 
        JOIN users ON archieved_posts.user_id = users.id 
        WHERE archieved_posts.id = %s
    """, (archieved_id,))
    post = cursor.fetchone()

    cursor.execute("""
        SELECT comments.archieved, comments.body, comments.created_at, users.first_name, users.last_name 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        WHERE comments.archieved_id = %s
        ORDER BY comments.created_at ASC
    """, (archieved_id,))
    comments = cursor.fetchall()
    cursor.close()
    
    return render_template('Post.html', post=post, comments=comments, archieved_check=True)

# @app.route('/new_post', methods=['GET', 'POST'])
# def new_post():
#     if request.method == 'POST':
#         title = request.form.get('title')
#         body = request.form.get('body')
#         user_id = session.get('user_id')

#         cursor = mysql.connection.cursor()
#         cursor.execute("INSERT INTO posts (user_id, title, body) VALUES (%s, %s, %s)", (user_id, title, body))
#         mysql.connection.commit()
#         cursor.close()
#         return redirect(url_for('discussion_board'))
#     return render_template('newPost.html')

@activePages.route('/post/<int:post_id>', methods=['GET', 'POST'])
def post(post_id):
    if request.method == 'POST':
        body = request.form.get('body')
        user_id = session.get('user_id')

        cursor = mysql.connection.cursor()
        cursor.execute("INSERT INTO comments (post_id, user_id, body) VALUES (%s, %s, %s)", (post_id, user_id, body))
        mysql.connection.commit()
        cursor.close()

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("""
        SELECT posts.*, users.first_name, users.last_name 
        FROM posts 
        JOIN users ON posts.user_id = users.id 
        WHERE posts.id = %s
    """, (post_id,))
    post = cursor.fetchone()

    cursor.execute("""
        SELECT comments.archieved, comments.body, comments.created_at, users.first_name, users.last_name 
        FROM comments 
        JOIN users ON comments.user_id = users.id 
        WHERE comments.post_id = %s
        ORDER BY comments.created_at ASC
    """, (post_id,))
    comments = cursor.fetchall()
    cursor.close()
    
    return render_template('Post.html', post=post, comments=comments, archieved_check=False)

@activePages.route('/calendar')
def calendar():
    return render_template('calendar.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('frontPages.home'))

app.register_blueprint(activePages)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
