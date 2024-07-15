from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_mysqldb import MySQL
import MySQLdb.cursors
import hashlib
import os
import datetime
from apscheduler.schedulers.background import BackgroundScheduler
## Not required if inputting manually 
import config

app = Flask(__name__)

# Change this to your secret key (it can be anything, it's for extra protection)
app.secret_key = 'your secret key'

# Enter your database connection details below
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 't9dGn6iug*5hdj_'
app.config['MYSQL_DB'] = 'Taskify'

# Initialize MySQL
mysql = MySQL(app)

def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static', 'Images'),
                               'favicon.ico')

# Scheduler to remove old completed tasks
scheduler = BackgroundScheduler()

def remove_old_completed_tasks():
    cursor = mysql.connection.cursor()
    cursor.execute("DELETE FROM tasks WHERE completed = TRUE AND completion_date < NOW() - INTERVAL 30 DAY")
    mysql.connection.commit()
    cursor.close()

scheduler.add_job(func=remove_old_completed_tasks, trigger="interval", days=1)
scheduler.start()

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        # Get form data
        email = request.form.get("email")
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        password = request.form.get("password")
        password2 = request.form.get("password2")

        # Check if passwords match
        if password != password2:
            return render_template("register.html", error="Passwords do not match")

        # Hash the password for security
        hashed_password = hashlib.sha256(password.encode()).hexdigest()

        cursor = mysql.connection.cursor()
        # Insert new user into the database
        cursor.execute("INSERT INTO users (email, first_name, last_name, passw) VALUES (%s, %s, %s, %s)",
                       (email, first_name, last_name, hashed_password))
        mysql.connection.commit()
        cursor.close()

        return redirect(url_for("login"))
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        
        # Hard-coded bypass for admin
        if email == "admin@mail.com" and password == "admin":
            session["user_id"] = "admin"
            return redirect(url_for("nextpage"))
        
        # Hash the password for security
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        # Retrieve the user's record from the database based on email
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()

        if not user:
            return render_template("login.html", error="Incorrect username or password")

        # Compare the provided password with the password stored in the database
        if user['passw'] == hashed_password:
            # Store user information in the session
            session["user_id"] = user['id']
            return redirect(url_for("nextpage"))
        else:
            return render_template("login.html", error="Incorrect username or password")

    return render_template("login.html")

@app.route('/')
def home():
    Background = os.path.join(os.path.join("static", "Images"), "background_1.jpg")
    return render_template('index.html', user_image=Background)

@app.route('/dashboard')
def nextpage():
    user_id = session.get("user_id")
    if user_id:
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        
        # Fetch user first name
        if user_id == "admin":
            first_name = "admin"
            tasks = []
        else:
            cursor.execute("SELECT first_name FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            first_name = user['first_name'] if user else None

            # Fetch tasks for the user using the dedicatedTo column
            cursor.execute("SELECT TID, task FROM tasks WHERE dedicatedTo = %s AND completed = FALSE", (user_id,))
            tasks = cursor.fetchall()
        
        cursor.close()
        
        if first_name:
            return render_template('dashboard.html', first_name=first_name, tasks=tasks)
    
    return redirect(url_for('login'))

@app.route('/task')
def task():
    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT id, first_name, last_name FROM users")
    users = cursor.fetchall()
    cursor.close()
    return render_template('htmltask.html', users=users)

@app.route('/submit_task', methods=['POST'])
def submit_task():
    task = request.form['task']
    dateOfTaskStart = request.form['dateOfTaskStart']
    timeOfTaskStart = request.form['timeOfTaskStart']
    dateOfTaskEnd = request.form['dateOfTaskEnd']
    timeOfTaskEnd = request.form['timeOfTaskEnd']
    dedicatedTo = session.get("user_id")
    descript = request.form['descript']
    user_id = session.get("user_id")

    sql = "INSERT INTO tasks (task, dateOfTaskStart, timeOfTaskStart, dateOfTaskEnd, timeOfTaskEnd, dedicatedTo, descript, user_id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
    val = (task, dateOfTaskStart, timeOfTaskStart, dateOfTaskEnd, timeOfTaskEnd, dedicatedTo, descript, user_id)

    cursor = mysql.connection.cursor()
    cursor.execute(sql, val)
    mysql.connection.commit()
    cursor.close()

    return redirect(url_for('task'))


@app.route('/complete_task', methods=['POST'])
def complete_task():
    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for('login'))

    task_id = request.json.get('task_id')  # Assuming you're sending JSON data
    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE tasks SET completed = TRUE, completion_date = NOW() WHERE TID = %s AND dedicatedTo = %s", (task_id, user_id))
    mysql.connection.commit()
    cursor.close()
    
    return jsonify(success=True)

@app.route('/completed_tasks')
def completed_tasks():
    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for('login'))

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    cursor.execute("SELECT TID, task FROM tasks WHERE dedicatedTo = %s AND completed = TRUE", (user_id,))
    tasks = cursor.fetchall()
    cursor.close()
    
    return render_template('completed_tasks.html', tasks=tasks)

@app.route('/mark_incomplete', methods=['POST'])
def mark_incomplete():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({'success': False, 'message': 'User not logged in'}), 401

    task_id = request.json.get('task_id')
    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE tasks SET completed = FALSE, completion_date = NULL WHERE TID = %s AND dedicatedTo = %s", (task_id, user_id))
    mysql.connection.commit()
    cursor.close()

    return jsonify({'success': True}), 200



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
