from flask import Flask, render_template, request, redirect, url_for, session
from flask_mysqldb import MySQL
import MySQLdb.cursors
import re
import hashlib 

app = Flask(__name__)

# Change this to your secret key (it can be anything, it's for extra protection)
app.secret_key = 'your secret key'

# Enter your database connection details below
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 't9dGn6iug*5hdj_'
app.config['MYSQL_DB'] = 'Taskify'

# Intialize MySQL
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
        
        # Hash the password for security
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        # Retrieve the user's record from the database based on email
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()

        if not user:
            return render_template("error.html", error="User not found")

        # Compare the provided password with the password stored in the database
        if user['passw'] == hashed_password:
            # Store user information in the session
            session["user_id"] = user['id']
            return redirect(url_for("nextpage"))
        else:
            return render_template("error.html", error="Incorrect password")

    return render_template("login.html")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/nextpage')
def nextpage():
    return render_template('nextlogin.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)

