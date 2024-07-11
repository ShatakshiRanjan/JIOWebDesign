from flask import Flask, render_template, request, redirect, url_for, session
from flask_mysqldb import MySQL
import MySQLdb.cursors
import hashlib
import os
## Not required if inputting manually 
import config

app = Flask(__name__)

# Change this to your secret key (it can be anything, it's for extra protection)
app.secret_key = 'your secret key'

# Enter your database connection details manually
#app.config['MYSQL_HOST'] = '127.0.0.1'
#app.config['MYSQL_USER'] = 'root'
#app.config['MYSQL_PASSWORD'] = 'root'
#app.config['MYSQL_DB'] = 'Taskify'

# Else: for information stored in config.py
app.config['MYSQL_HOST'] = config.MYSQL_HOST
app.config['MYSQL_USER'] = config.MYSQL_USER
app.config['MYSQL_PASSWORD'] = config.MYSQL_PASSWORD
app.config['MYSQL_DB'] = config.MYSQL_DB

# Initialize MySQL
mysql = MySQL(app)

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
        #if email == "admin@mail.com" and password == "admin":
        #    session["user_id"] = "admin"
        #    return redirect(url_for("nextpage"))
        
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
            cursor.execute("SELECT task FROM tasks WHERE dedicatedTo = %s", (user_id,))
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
    user_id = session.get("user_id")
    if not user_id:
        return redirect(url_for('login'))

    task = request.form['task']
    dateOfTaskStart = request.form.get('dateOfTaskStart')
    timeOfTaskStart = request.form.get('timeOfTaskStart')
    dateOfTaskEnd = request.form.get('dateOfTaskEnd')
    timeOfTaskEnd = request.form.get('timeOfTaskEnd')
    dedicatedTo = request.form['dedicatedTo']
    descript = request.form['descript']
    
    cursor = mysql.connection.cursor()
    sql = """
        INSERT INTO tasks (
            user_id, task, dateOfTaskStart, timeOfTaskStart, dateOfTaskEnd, timeOfTaskEnd, dedicatedTo, descript
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    val = (user_id, task, dateOfTaskStart, timeOfTaskStart, dateOfTaskEnd, timeOfTaskEnd, dedicatedTo, descript)
    cursor.execute(sql, val)
    mysql.connection.commit()
    cursor.close()
    
    return redirect('/task')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)

