from RedisConnector import RedisConnector

def main():
    r = RedisConnector()

    # SET and GET
    r.set_value("hello", "world")
    print("hello:", r.get_value("hello"))

    # Delete a key
    r.delete_value("hello")
    print("after delete, hello:", r.get_value("hello"))

    r.close()

if __name__ == "__main__":
    main()