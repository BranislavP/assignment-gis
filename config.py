import os


class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or "postgresql://postgres:postgres@localhost:5432/pdt_gis"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
