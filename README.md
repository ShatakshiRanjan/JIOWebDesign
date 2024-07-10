# JIOWebDesign

--How To Run--
1) Git clone or download zip from the repository
2) Navigate to "Flask" Directory
   '''
   cd JIOWebDesign/Flask
   '''
3) Create a virtual environment (optional but recommended)
   '''
   python -m venv venv
   '''

   Activate environment:
   Windows - 'venv\Scripts\activate'
   Mac - 'source venv/bin/activate'

4) Install the required dependencies
5) Set up the MySQL database
6) Ensure MySQL server is running
7) Use Schema.sql script to create database
8) Update the MySQL connection details in 'main.py'
   '''
   app.config['MYSQL_HOST'] = '127.0.0.1'
   app.config['MYSQL_USER'] = 'root'
   app.config['MYSQL_PASSWORD'] = 'your_mysql_password'
   app.config['MYSQL_DB'] = 'Taskify'
   '''
10) Run the Flask application
   '''
   python main.py
   '''
11) Access the application
    Navigate to
    '''
    http://127.0.0.1:8000
    '''

