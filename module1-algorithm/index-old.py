import os
from flask import Flask, request
import nltk, urllib
from textblob import TextBlob


#create training and test data
train = [
	('I love this sandwich.', 'pos'),
    ('this is an amazing place!', 'pos'),
    ('I feel very good about these beers.', 'pos'),
    ('this is my best work.', 'pos'),
    ("what an awesome view", 'pos'),
    ('I do not like this restaurant', 'neg'),
    ('I am tired of this stuff.', 'neg'),
    ("I can't deal with this", 'neg'),
    ('he is my sworn enemy!', 'neg'),
    ('my boss is horrible.', 'neg')
]

test = [
	('the beer was good.', 'pos'),
    ('I do not enjoy my job', 'neg'),
    ("I ain't feeling dandy today.", 'neg'),
    ("I feel amazing!", 'pos'),
    ('Gary is a friend of mine.', 'pos'),
    ("I can't believe I'm doing this.", 'neg')
]
#from textblob.classifiers import NaiveBayesClassifier
#cl = NaiveBayesClassifier(train)

from nltk.tokenize import word_tokenize
all_words = set(word.lower() for passage in train for word in word_tokenize(passage[0]))
t = [({word: (word in word_tokenize(x[0])) for word in all_words}, x[1]) for x in train]
cl = nltk.NaiveBayesClassifier.train(t)

def sentiment_json(text):
    blob = TextBlob(text, classifier=cl)
    return blob.json


app = Flask(__name__)
app.debug = True

@app.route('/')
def index():
	return '<h2>Final year project on Opinion Mining and Sentiment Analysis.</h2>'+ \
	'<p>Project members : <ul><li>Prashant Jadhav</li><li>Rahul Karande</li><li>Munmoon Ghosh</li><li>Amit Shinde</li></ul></p>'

@app.route('/api', methods=['GET','POST'])
def sentiment():
    doc = request.values.get('text')
    #doc=urllib.unquote(doc).decode('utf8')
    return sentiment_json(doc)

if __name__ == "__main__":
    app.run(port=8000)