from flask import Response
from flask_restful import Resource
from models import Story
from views import get_authorized_user_ids
import json

class StoriesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def get(self):
        # get stories created by one of these users:
        # au = get_authorized_user_ids(self.current_user)
        stories = Story.query.filter(Story.user_id.in_(get_authorized_user_ids(self.current_user))).all()
        
        return Response(json.dumps([s.to_dict() for s in stories]), mimetype="application/json", status=200)


def initialize_routes(api):
    api.add_resource(
        StoriesListEndpoint, 
        '/api/stories', 
        '/api/stories/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
