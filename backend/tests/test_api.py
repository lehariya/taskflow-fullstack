import os
import tempfile
import unittest
from app import create_app, db

class TaskFlowApiTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.tmp.close()
        self.app = create_app({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": f"sqlite:///{self.tmp.name}",
        })
        self.client = self.app.test_client()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
        os.unlink(self.tmp.name)

    def test_health(self):
        self.assertEqual(self.client.get("/api/health").status_code, 200)

    def test_add_single_task_starts_at_zero(self):
        response = self.client.post("/api/todos", json={"title": "Read Blog"})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json["created"][0]["update_count"], 0)

    def test_bulk_task_creation(self):
        response = self.client.post("/api/todos", json={"title": "Make Food 3"})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json["count"], 3)
        self.assertEqual([x["title"] for x in response.json["created"]], ["Make Food"] * 3)

    def test_edit_increments_counter(self):
        created = self.client.post("/api/todos", json={"title": "Read"})
        task_id = created.json["created"][0]["id"]
        updated = self.client.put(f"/api/todos/{task_id}", json={"title": "Read book"})
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json["update_count"], 1)

    def test_empty_title_rejected(self):
        self.assertEqual(self.client.post("/api/todos", json={"title": " "}).status_code, 400)

    def test_delete(self):
        created = self.client.post("/api/todos", json={"title": "Remove me"})
        task_id = created.json["created"][0]["id"]
        self.assertEqual(self.client.delete(f"/api/todos/{task_id}").status_code, 200)
        self.assertEqual(self.client.get("/api/todos").json, [])

if __name__ == "__main__":
    unittest.main()
