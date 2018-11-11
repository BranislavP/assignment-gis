from flask_wtf import FlaskForm
from wtforms import SubmitField, HiddenField, FloatField, SelectMultipleField
from wtforms.validators import DataRequired, NumberRange


class AmenityDistanceForm(FlaskForm):
    distance = FloatField('Distance', validators=[DataRequired(), NumberRange(min=0.0)])
    choices = [('pharmacy', 'Pharmacy'), ('bar', 'Bar'), ('restaurant', 'Restaurant'), ('school', 'School')]
    amenities = SelectMultipleField('Amenities', validators=[DataRequired()], choices=choices)
    lng = HiddenField('Lng')
    lat = HiddenField('Lat')

