from flask import Response, request
from flask_restful import Resource
from models import LikePost, db, Post, Following
import json

class PostLikesListEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def post(self):
        # create a new "like_post" based on the data posted in the body 
        body = request.get_json()
        try:
          id = int(body.get('post_id'))
        except:
          return Response('anumerical post_id', mimetype="application/json", status=400)
        
        post = Post.query.get(id)
        if not post:
          return Response('nonexisting post', mimetype="application/json", status=404)
          
        following = Following.query.filter_by(user_id=self.current_user.id).all() 
        following = [f.to_dict_following().get('following').get('id') for f in following]
        if post.to_dict().get('user').get('id') not in following:
          return Response('notfollowing poster', mimetype="application/json", status=404)
        
        liked = LikePost.query.filter_by(user_id=self.current_user.id).all()
        liked = [l.to_dict().get('post_id') for l in liked]
        print(liked, id)
        if id in liked:
          return Response('duplicated like', mimetype="application/json", status=400)
        
        new_like = LikePost(user_id=self.current_user.id, post_id=id)
        db.session.add(new_like)
        db.session.commit()
        return Response(json.dumps(new_like.to_dict()), mimetype="application/json", status=201)
        
        # wow, turns out you check scope > exisitance > authority > duplication

class PostLikesDetailEndpoint(Resource):

    def __init__(self, current_user):
        self.current_user = current_user
    
    def delete(self, id):
        # delete "like_post" where "id"=id
        print(id)
        try:
          id = int(id)
        except:
          return Response('invalid id format', mimetype="application/json", status=404)
        
        like = LikePost.query.get(id)
        if not like:
          return Response('notexist id', mimetype="application/json", status=404)
          
        if like.to_dict().get('user_id') != self.current_user.id:
          return Response('notyour id', mimetype="application/json", status=404)
          
        LikePost.query.filter_by(id=id).delete()
        db.session.commit()
        return Response(json.dumps({}), mimetype="application/json", status=200)



def initialize_routes(api):
    api.add_resource(
        PostLikesListEndpoint, 
        '/api/posts/likes', 
        '/api/posts/likes/', 
        resource_class_kwargs={'current_user': api.app.current_user}
    )

    api.add_resource(
        PostLikesDetailEndpoint, 
        '/api/posts/likes/<int:id>', 
        '/api/posts/likes/<int:id>/',
        resource_class_kwargs={'current_user': api.app.current_user}
    )
