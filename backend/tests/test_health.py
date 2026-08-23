def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_health_through_vercel_service_prefix(client):
    response = client.get("/svc/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
