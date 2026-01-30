from app import app, db

if __name__ == "__main__":
    with app.app_context():
        print("Dropping all database tables...")
        # db.reflect() # Not strictly necessary if models are imported, which they are in app.py
        db.drop_all()
        print("Tables dropped.")
        
        print("Creating all database tables with new schema...")
        db.create_all()
        print("Tables created successfully!")
