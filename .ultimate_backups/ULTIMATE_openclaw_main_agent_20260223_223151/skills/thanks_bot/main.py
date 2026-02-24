import os
import tweepy
import time
from datetime import datetime, timedelta

class ThanksBot:
    def __init__(self):
        self.client = tweepy.Client(
            bearer_token=os.getenv('X_BEARER_TOKEN'),
            consumer_key=os.getenv('X_API_KEY'),
            consumer_secret=os.getenv('X_API_SECRET'),
            access_token=os.getenv('X_ACCESS_TOKEN'),
            access_token_secret=os.getenv('X_ACCESS_SECRET')
        )
        self.me = self.client.get_me().data.id
        self.last_check = datetime.utcnow() - timedelta(minutes=5)
        
    def run(self):
        try:
            mentions = self.client.get_users_mentions(
                self.me, 
                start_time=self.last_check.isoformat() + "Z",
                tweet_fields=['author_id', 'conversation_id']
            )
            
            if not mentions.data:
                return "No new mentions to thank"
                
            thanked = 0
            for tweet in mentions.data:
                if tweet.author_id == self.me:
                    continue
                    
                reply_text = "Thanks for reaching out! 🙏"
                
                self.client.create_tweet(
                    text=reply_text,
                    in_reply_to_tweet_id=tweet.id
                )
                thanked += 1
                time.sleep(2)
                
            self.last_check = datetime.utcnow()
            return f"Thanked {thanked} people"
            
        except Exception as e:
            return f"Error: {str(e)}"

def main():
    bot = ThanksBot()
    return bot.run()
