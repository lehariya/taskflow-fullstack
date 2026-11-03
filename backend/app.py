import logging
import os
import re
from pathlib import Path

import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError

BASE_DIR = Path(__file__).resolve().parent
db = SQLAlchemy()


class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    update_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, server_default=db.func.current_timestamp())

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "update_count": self.update_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

def create_app(test_config=None):
    app = Flask(__name__)
    app.config.update(
        SQLALCHEMY_DATABASE_URI=os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'taskflow.db'}"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JSON_SORT_KEYS=False,
    )
    if test_config:
        app.config.update(test_config)
    CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_ORIGIN", "*")}})
    db.init_app(app)
    logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
    logger = logging.getLogger(__name__)


    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "TaskFlow API"})

    @app.get("/api/todos")
    def get_todos():
        todos = Todo.query.order_by(Todo.id.desc()).all()
        return jsonify([todo.to_dict() for todo in todos])

    @app.post("/api/todos")
    def create_todos():
        data = request.get_json(silent=True) or {}
        raw_title = str(data.get("title", "")).strip()
        if not raw_title:
            return jsonify({"error": "Task name is required."}), 400
        if len(raw_title) > 200:
            return jsonify({"error": "Task name must be 200 characters or fewer."}), 400

        # A trailing positive integer is treated as the requested quantity.
        match = re.fullmatch(r"(.+?)\s+(\d+)", raw_title)
        title, quantity = raw_title, 1
        if match:
            title = match.group(1).strip()
            quantity = int(match.group(2))
            if not title:
                return jsonify({"error": "Please provide a task name before the quantity."}), 400
            if quantity < 1 or quantity > 50:
                return jsonify({"error": "Quantity must be between 1 and 50."}), 400
        if len(title) > 200:
            return jsonify({"error": "Task name must be 200 characters or fewer."}), 400

        try:
            created = [Todo(title=title, update_count=0) for _ in range(quantity)]
            db.session.add_all(created)
            db.session.commit()
            return jsonify({"created": [todo.to_dict() for todo in created],
                            "count": len(created)}), 201
        except SQLAlchemyError:
            db.session.rollback()
            logger.exception("Could not create tasks")
            return jsonify({"error": "Unable to save tasks. Please try again."}), 500

    @app.put("/api/todos/<int:todo_id>")
    def update_todo(todo_id):
        todo = db.session.get(Todo, todo_id)
        if todo is None:
            return jsonify({"error": "Task not found."}), 404
        data = request.get_json(silent=True) or {}
        title = str(data.get("title", "")).strip()
        if not title:
            return jsonify({"error": "Task name cannot be empty."}), 400
        if len(title) > 200:
            return jsonify({"error": "Task name must be 200 characters or fewer."}), 400
        todo.title = title
        todo.update_count += 1
        try:
            db.session.commit()
            return jsonify(todo.to_dict())
        except SQLAlchemyError:
            db.session.rollback()
            logger.exception("Could not update task %s", todo_id)
            return jsonify({"error": "Unable to update task."}), 500

    @app.delete("/api/todos/<int:todo_id>")
    def delete_todo(todo_id):
        todo = db.session.get(Todo, todo_id)
        if todo is None:
            return jsonify({"error": "Task not found."}), 404
        db.session.delete(todo)
        db.session.commit()
        return jsonify({"message": "Task deleted successfully."})

    @app.get("/api/products")
    def get_products():
        try:
            response = requests.get("https://fakestoreapi.com/products", timeout=12)
            response.raise_for_status()
            return jsonify(response.json())
        except requests.RequestException:
            logger.exception("Fake Store API request failed")
            return jsonify({"error": "Product service is unavailable. Check your internet connection and try again."}), 502

    @app.get("/api/products/<int:product_id>")
    def get_product(product_id):
        try:
            response = requests.get(f"https://fakestoreapi.com/products/{product_id}", timeout=12)
            if response.status_code == 404:
                return jsonify({"error": "Product not found."}), 404
            response.raise_for_status()
            return jsonify(response.json())
        except requests.RequestException:
            logger.exception("Fake Store API detail request failed")
            return jsonify({"error": "Product service is unavailable. Please try again."}), 502

    with app.app_context():
        db.create_all()
    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG") == "1")
