from flask import Response, request
from flask_restful import Resource
from models import Post, db, Following
from views import get_authorized_user_ids

import json

def get_path():
    return request.host_url + 'api/posts/'

class PostListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user

    def get(self):
        # get posts created by one of these users:
        try:
          limit = int(request.args.get('limit') or 20)
          if limit > 50: raise Exception("exceeds 50")
        except:
          return Response('nope', mimetype="application/json", status=400)
        user_ids = get_authorized_user_ids(self.current_user)
        posts = Post.query.filter(Post.user_id.in_(user_ids)).limit(limit).all()
        posts = [ p.to_dict(user=self.current_user) for p in posts]
        return Response(json.dumps(posts), mimetype="application/json", status=200)

    def post(self):
        # create a new post based on the data posted in the body 
        body = request.get_json()
        try:
          new_post = Post(
              image_url=body.get('image_url'),
              user_id=self.current_user.id, # must be a valid user_id or will throw an error
              caption=body.get('caption') or None,
              alt_text=body.get('alt_text') or None
          )
          db.session.add(new_post)
          db.session.commit()
          return Response(json.dumps(new_post.to_dict()), mimetype="application/json", status=201)
        except:
          return Response('bad post', mimetype="application/json", status=400)
        
class PostDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
        
    def patch(self, id):
        # update post based on the data posted in the body 
        try:
          post = Post.query.get(id)
          if not post:
            return Response('id does not exist', mimetype="application/json", status=404)
          user_ids = get_authorized_user_ids(self.current_user)
          if post.to_dict().get('user').get('id') not in user_ids:
            return Response('unauthorized id', mimetype="application/json", status=404)
        except:
          return Response('bad id', mimetype="application/json", status=404)
        
        
        body = request.get_json()
        # for key in range()
        if body.get('image_url'):
          post.image_url = body.get('image_url')
        if body.get('caption'):
          post.caption = body.get('caption')
        if body.get('alt_text'):
          post.alt_text = body.get('alt_text')
        db.session.add(post)    # issues the insert statement
        db.session.commit() 
        # print(body)
        return Response(json.dumps(post.to_dict()), mimetype="application/json", status=200)


    def delete(self, id):
        # delete post where "id"=id
        # print("useridis: ",id)
        try:
          post = Post.query.get(id)
          if not post:
            return Response('id does not exist', mimetype="application/json", status=404)
          user_ids = get_authorized_user_ids(self.current_user)
          if post.to_dict().get('user').get('id') not in user_ids:
            return Response('unauthorized id', mimetype="application/json", status=404)
        except:
          return Response('bad id', mimetype="application/json", status=404)
        Post.query.filter_by(id=id).delete()
        db.session.commit()
        return Response(json.dumps({}), mimetype="application/json", status=200)


    def get(self, id):
        try:
          post = Post.query.get(id)
          if not post:
            return Response('id does not exist', mimetype="application/json", status=404)
          user_ids = get_authorized_user_ids(self.current_user)
          if post.to_dict().get('user').get('id') not in user_ids:
            return Response('unauthorized id', mimetype="application/json", status=404)
        except:
          return Response('bad id', mimetype="application/json", status=404)
        
        return Response(json.dumps(post.to_dict(user=self.current_user)), mimetype="application/json", status=200)

def initialize_routes(api):
    api.add_resource(
        PostListEndpoint, 
        '/api/posts', '/api/posts/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )
    api.add_resource(
        PostDetailEndpoint, 
        '/api/posts/<int:id>', '/api/posts/<int:id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )