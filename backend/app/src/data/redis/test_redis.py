from RedisConnector import RedisConnector


def test_key_crud(connector: RedisConnector) -> None:
    key = "test:key:hello"
    connector.delete_value(key)

    connector.set_value(key, "world")
    assert connector.get_value(key) == "world"

    connector.delete_value(key)
    assert connector.get_value(key) is None


def test_queue_ops(connector: RedisConnector) -> None:
    queue = "test:queue"
    connector.delete_value(queue)

    connector.enqueue(queue, "msg1")
    connector.enqueue(queue, "msg2")

    assert connector.queue_length(queue) == 2
    assert connector.dequeue(queue) == "msg1"
    assert connector.dequeue(queue) == "msg2"
    assert connector.queue_length(queue) == 0

    # Blocking dequeue should timeout and return None when empty
    assert connector.dequeu_blocking(queue, timeout=1) is None


def main() -> None:
    conn = RedisConnector()
    try:
        test_key_crud(conn)
        test_queue_ops(conn)
        print("Redis connector smoke tests passed.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()