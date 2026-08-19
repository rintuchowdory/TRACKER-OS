import datetime as dt

from app.models import GratitudeEntry


def test_list_entries_empty(client):
    response = client.get("/api/gratitude")
    assert response.status_code == 200
    assert response.json() == []


def test_get_today_returns_null_when_missing(client):
    response = client.get("/api/gratitude/today")
    assert response.status_code == 200
    assert response.json() is None


def test_save_today_creates_entry(client):
    response = client.post(
        "/api/gratitude",
        json={"item_1": "coffee", "item_2": "sun", "item_3": "friends"},
    )
    assert response.status_code == 200

    body = response.json()
    assert body["item_1"] == "coffee"
    assert body["item_2"] == "sun"
    assert body["item_3"] == "friends"
    assert body["entry_date"] == dt.date.today().isoformat()
    assert body["id"] > 0
    assert body["created_at"]


def test_save_today_defaults_missing_items_to_empty_strings(client):
    body = client.post("/api/gratitude", json={"item_1": "only one"}).json()
    assert body["item_1"] == "only one"
    assert body["item_2"] == ""
    assert body["item_3"] == ""


def test_save_today_updates_existing_entry_instead_of_inserting(client, db):
    first = client.post("/api/gratitude", json={"item_1": "a", "item_2": "b", "item_3": "c"}).json()
    second = client.post("/api/gratitude", json={"item_1": "x", "item_2": "y", "item_3": "z"}).json()

    assert second["id"] == first["id"]
    assert [second["item_1"], second["item_2"], second["item_3"]] == ["x", "y", "z"]
    assert db.query(GratitudeEntry).count() == 1


def test_get_today_returns_saved_entry(client):
    saved = client.post("/api/gratitude", json={"item_1": "gym"}).json()

    body = client.get("/api/gratitude/today").json()
    assert body["id"] == saved["id"]
    assert body["item_1"] == "gym"


def test_get_today_ignores_entries_from_other_dates(client, db):
    db.add(GratitudeEntry(entry_date=dt.date.today() - dt.timedelta(days=1), item_1="yesterday"))
    db.commit()

    assert client.get("/api/gratitude/today").json() is None


def test_list_entries_is_ordered_by_entry_date_descending(client, db):
    today = dt.date.today()
    for offset in (2, 0, 1):
        db.add(GratitudeEntry(entry_date=today - dt.timedelta(days=offset), item_1=str(offset)))
    db.commit()

    dates = [entry["entry_date"] for entry in client.get("/api/gratitude").json()]
    assert dates == [
        today.isoformat(),
        (today - dt.timedelta(days=1)).isoformat(),
        (today - dt.timedelta(days=2)).isoformat(),
    ]


def test_list_entries_limits_to_90_most_recent(client, db):
    today = dt.date.today()
    for offset in range(100):
        db.add(GratitudeEntry(entry_date=today - dt.timedelta(days=offset)))
    db.commit()

    body = client.get("/api/gratitude").json()
    assert len(body) == 90
    assert body[0]["entry_date"] == today.isoformat()
    assert body[-1]["entry_date"] == (today - dt.timedelta(days=89)).isoformat()


def test_save_today_rejects_invalid_payload_types(client):
    response = client.post("/api/gratitude", json={"item_1": 5})
    assert response.status_code == 422
