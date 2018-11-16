from flask_wtf import FlaskForm
from wtforms import SubmitField, HiddenField, FloatField, SelectMultipleField, SelectField, StringField
from wtforms.validators import DataRequired, NumberRange
from .settings import SELECTABLE_AMENITIES


class AmenityDistanceForm(FlaskForm):
    distance = FloatField('Distance', validators=[DataRequired(), NumberRange(min=0.0)])
    choices = [(key, value) for key, value in SELECTABLE_AMENITIES.items()]
    amenities = SelectMultipleField('Amenities', validators=[DataRequired()], choices=choices)
    lng = HiddenField('Lng')
    lat = HiddenField('Lat')

'''
class AmenityCityForm(FlaskForm):
    

    def __init__(self, choices, *args, **kwargs):
        cities_choices = [(row['name'], row['name']) for row in choices]
        self.cities = SelectField('City', validators=[DataRequired()], choices=cities_choices)
        super(AmenityCityForm, self).__init__(*args, **kwargs)
        '''


def amenity_city_form(choices, **kwargs):
    class AmenityCityForm(FlaskForm):
        amenity_choices = [(key, value) for key, value in SELECTABLE_AMENITIES.items()]
        amenities = SelectMultipleField('Amenities', validators=[DataRequired()], choices=amenity_choices)
        cities = StringField('City')

    cities_choices = [(row['name'], row['name']) for row in choices]
    field = SelectField('City', validators=[DataRequired()], choices=cities_choices)
    setattr(AmenityCityForm, 'cities', field)

    return AmenityCityForm(**kwargs)


def city_roads_form(choices, **kwargs):
    class CityRoadsForm(FlaskForm):
        cities = StringField('City')

    cities_choices = [(row['name'], row['name']) for row in choices]
    field = SelectField('City', validators=[DataRequired()], choices=cities_choices)
    setattr(CityRoadsForm, 'cities', field)

    return CityRoadsForm(**kwargs)

