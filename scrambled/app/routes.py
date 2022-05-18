from flask import render_template, flash, redirect, url_for, request, jsonify, Markup
from sqlalchemy import Numeric
from app.models import Statistics
from app import app, db
from app.forms import LoginForm, RegistrationForm, EditProfileForm, EmptyForm, PostForm, ResetPasswordRequestForm, ResetPasswordForm
from app.email import send_password_reset_email
from flask_login import current_user, login_required, login_user, logout_user
from app.models import User, Post
from werkzeug.urls import url_parse
from datetime import datetime
import json
from sqlalchemy.sql.expression import func
from app.game import scrambledLetters, checkWordExists
import re

@app.route('/',methods=['GET','POST'])
@app.route('/welcome', methods=['GET', 'POST'])
def welcome():
    return render_template('welcome.html', title='Welcome')


@app.route('/index', methods=['GET', 'POST'])
def index():
    return render_template("index.html", title='Normal Scrambled')


@app.route('/speed', methods=['GET', 'POST'])
def speed():
    return render_template("speed.html", title='Speed Scrambled')


@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    top10 = Statistics.query.order_by(Statistics.score.desc()).limit(10).all()
    return render_template('leaderboard.html', stats=top10)


@login_required
@app.route('/statistics/<username>',methods=['GET','POST'])
def stats(username):
    stats = Statistics.query.filter_by(userId=username).order_by(Statistics.score).all()
    averagegameScore = db.session.query(db.func.avg(Statistics.score)).outerjoin(User, User.username == Statistics.userId).group_by(Statistics.userId).filter(Statistics.userId == username).all()
    scoresforNormalData = db.session.query(Statistics.score,Statistics.game_completed).outerjoin(User, User.username==Statistics.userId).filter(Statistics.userId == username).filter(Statistics.gameMode=="normal").all()
    scoresforSpeedData = db.session.query(Statistics.score,Statistics.game_completed).outerjoin(User, User.username==Statistics.userId).filter(Statistics.userId == username).filter(Statistics.gameMode=="speed").all()
    datesofSubmissions = db.session.query(Statistics.game_completed,Statistics.score).outerjoin(User, User.username==Statistics.userId).filter(Statistics.userId == username).order_by(Statistics.game_completed.asc()).limit(10).all()
  
    scoresforNormal = []
   
    for amounts, _ in scoresforNormalData:
        scoresforNormal.append(amounts)
    scoresforSpeed = []
    for amounts, _ in scoresforSpeedData:
        scoresforSpeed.append(amounts) 
    dates = []
    for amounts2, _ in datesofSubmissions:
        dates.append(amounts2)
    return render_template('statistics.html', stats=stats, averagegameScore=json.dumps(averagegameScore,indent=0,sort_keys=True,default=str),datesScore=json.dumps(scoresforNormal),datesofSubmissions=json.dumps(dates,indent=4,sort_keys=True,default=str),speedScores=json.dumps(scoresforSpeed,indent=4,sort_keys=True,default=str),)
    
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        user = str(current_user)

        user = re.sub('User','',user)
        user = re.sub('<','',user)
        user = re.sub('>','',user)

        username = user.strip()
        return redirect(url_for('stats',username=username))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            flash('Invalid username or password')
            return redirect(url_for('login'))
        login_user(user, remember=form.remember_me.data)
        print(current_user.is_authenticated)
        return redirect(url_for('index'))
    return render_template('login.html', title='Sign In', form=form)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(username=form.username.data, email=form.email.data)
        user.set_password(form.password.data)
        db.session.add(user)
        db.session.commit()
        flash('Congratulations, you are now a registered user!')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)

@app.route('/user/<username>')
@login_required
def user(username):
    user = User.query.filter_by(username=username).first_or_404()
    page = request.args.get('page', 1, type=int)
    posts = user.posts.order_by(Post.timestamp.desc()).paginate(
        page, app.config['POSTS_PER_PAGE'], False)
    next_url = url_for('user', username=user.username, page=posts.next_num) \
        if posts.has_next else None
    prev_url = url_for('user', username=user.username, page=posts.prev_num) \
        if posts.has_prev else None
    form = EmptyForm()
    return render_template('user.html', user=user, posts=posts.items,
                           next_url=next_url, prev_url=prev_url, form=form)


@app.before_request
def before_request():
    if current_user.is_authenticated:
        current_user.last_seen = datetime.utcnow()
        db.session.commit()


@app.route('/edit_profile', methods=['GET', 'POST'])
@login_required
def edit_profile():
    form = EditProfileForm(current_user.username)
    if form.validate_on_submit():
        current_user.username = form.username.data
        current_user.about_me = form.about_me.data
        db.session.commit()
        flash('Your changes have been saved.')
        return redirect(url_for('edit_profile'))
    elif request.method == 'GET':
        form.username.data = current_user.username
        form.about_me.data = current_user.about_me
    return render_template('edit_profile.html', title='Edit Profile',
                           form=form)


@app.route('/follow/<username>', methods=['POST'])
@login_required
def follow(username):
    form = EmptyForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=username).first()
        if user is None:
            flash('User {} not found.'.format(username))
            return redirect(url_for('index'))
        if user == current_user:
            flash('You cannot follow yourself!')
            return redirect(url_for('user', username=username))
        current_user.follow(user)
        db.session.commit()
        flash('You are following {}!'.format(username))
        return redirect(url_for('user', username=username))
    else:
        return redirect(url_for('index'))


@app.route('/unfollow/<username>', methods=['POST'])
@login_required
def unfollow(username):
    form = EmptyForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=username).first()
        if user is None:
            flash('User {} not found.'.format(username))
            return redirect(url_for('index'))
        if user == current_user:
            flash('You cannot unfollow yourself!')
            return redirect(url_for('user', username=username))
        current_user.unfollow(user)
        db.session.commit()
        flash('You are not following {}.'.format(username))
        return redirect(url_for('user', username=username))
    else:
        return redirect(url_for('index'))


@app.route('/explore')
@login_required
def explore():
    page = request.args.get('page', 1, type=int)
    posts = Post.query.order_by(Post.timestamp.desc()).paginate(
        page, app.config['POSTS_PER_PAGE'], False)
    next_url = url_for('explore', page=posts.next_num) \
        if posts.has_next else None
    prev_url = url_for('explore', page=posts.prev_num) \
        if posts.has_prev else None
    return render_template("game.html", title='Explore', posts=posts.items,
                           next_url=next_url, prev_url=prev_url)


@app.route('/reset_password_request', methods=['GET', 'POST'])
def reset_password_request():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = ResetPasswordRequestForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user:
            send_password_reset_email(user)
        flash('Check your email for the instructions to reset your password')
        return redirect(url_for('login'))
    return render_template('reset_password_request.html',
                           title='Reset Password', form=form)


@app.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    user = User.verify_reset_password_token(token)
    if not user:
        return redirect(url_for('index'))
    form = ResetPasswordForm()
    if form.validate_on_submit():
        user.set_password(form.password.data)
        db.session.commit()
        flash('Your password has been reset.')
        return redirect(url_for('login'))
    return render_template('reset_password.html', form=form)

@app.route('/checkword', methods=["GET", "POST"]) 
def checkWord():
    word = request.args['word']
    checkResponse = jsonify({'outcome':checkWordExists(word)})
    return checkResponse

@app.route('/letters/normal')
def lettersNormal():
    letters = scrambledLetters("normal")
    lettersResponse = jsonify({'letters':letters})
    return lettersResponse

@app.route("/letters/speed")
def lettersSpeed():
    letters = scrambledLetters("speed")
    lettersResponse = jsonify({'letters':letters})
    return lettersResponse

@app.route("/submitscore/normal", methods=["GET"])
def submitNormalScore(self):
    json.loads(request.data)
    return "hello"

@app.route("/submitscore/speed", methods=["POST"])
def submitSpeedScore():
    gameStat = json.loads(request.data)
    print(gameStat['speedScore'])
    return "hello"
