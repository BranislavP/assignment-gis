from flask import render_template
from app import app
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(app)

@app.route('/')
@app.route('/index')
def index():
    user = {'username': 'Breno'}
    print(list(db.engine.execute("SELECT * FROM planet_osm_point"))[0])
    return render_template('index.html', title='Home', user=user)
