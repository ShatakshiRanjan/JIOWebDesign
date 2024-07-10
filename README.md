# JIOWebDesign

## How To Run

1. **Clone the repository or download the zip file:**
    ```sh
    git clone https://github.com/ShatakshiRanjan/JIOWebDesign
    ```

2. **Navigate to the "Flask" Directory:**
    ```sh
    cd JIOWebDesign/Flask
    ```

3. **Create a virtual environment (optional but recommended):**
    ```sh
    python -m venv venv
    ```

   **Activate the environment:**
   - On Windows:
     ```sh
     venv\Scripts\activate
     ```
   - On Mac/Linux:
     ```sh
     source venv/bin/activate
     ```

4. **Install the required dependencies:**
    ```sh
    pip install -r requirements.txt
    ```

5. **Set up the MySQL database:**
    - Ensure MySQL server is running.

6. **Use `Schema.sql` script to create the database:**
    ```sh
    mysql -u root -p < Schema.sql
    ```

7. **Update the MySQL connection details in `main.py`:**
    ```python
    app.config['MYSQL_HOST'] = '127.0.0.1'
    app.config['MYSQL_USER'] = 'root'
    app.config['MYSQL_PASSWORD'] = 'your_mysql_password'
    app.config['MYSQL_DB'] = 'Taskify'
    ```

8. **Run the Flask application:**
    ```sh
    python main.py
    ```

9. **Access the application:**
    - Open a web browser and navigate to:
      ```sh
      http://127.0.0.1:8000
      ```

---

This README provides detailed instructions on how to set up and run the Flask application for JIOWebDesign using markdown syntax.
