from flask import Flask, g, render_template, request, redirect, url_for, session
import sqlite3
from os import urandom
from dotenv import load_dotenv
import os

# Initialize Flask app
app = Flask(__name__)
app.secret_key = urandom(24)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
load_dotenv()

# Database configuration
DATABASE = 'profiles.db'
app.config['DATABASE'] = DATABASE

# Helper function to get the database connection
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

def init_db():
    with app.app_context():
        db = get_db()
        with app.open_resource('schema.sql') as f:
            db.executescript(f.read().decode('utf-8'))

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

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

        db = get_db()
        cursor = db.cursor()

        # Insert new user into the database
        cursor.execute("INSERT INTO users (email, first_name, last_name, passw) VALUES (?, ?, ?, ?)", 
                       (email, first_name, last_name, password))
        db.commit()

        return redirect(url_for("login"))
    return render_template("register.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        
        db = get_db()
        cursor = db.cursor()

        # Retrieve the user's record from the database based on email
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

        if not user:
            return render_template("error.html", error="User not found")

        # Compare the provided password with the password stored in the database
        if user[4] == password:  # Assuming both are plain text
            # Store user information in the session
            session["user_id"] = user[0]
            return redirect(url_for("home"))
        else:
            return render_template("error.html", error="Incorrect password")

    return render_template("login.html")

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    if not os.path.exists(DATABASE):
        init_db()
    app.run(host='0.0.0.0', port=8000, debug=True)
