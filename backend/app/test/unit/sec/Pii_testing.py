if __name__ == "__main__":
    # Test contains PII
    assert(PIIDataScrubber.does_contain_pii('hello, my ssn is: 000-00-0000') == True)
    assert(PIIDataScrubber.does_contain_pii('hello world!') == False)

    # Test replacement
    assert(PIIDataScrubber.scrub_pii('hello world!') == 'hello world!')
    assert(PIIDataScrubber.scrub_pii('hello, my ssn is: 000-00-0000') == 'hello, my ssn is: **REDACTED**')

    # Phone tests
    assert(PIIDataScrubber.does_contain_pii('call me at 123-456-7890') == True)
    assert(PIIDataScrubber.scrub_pii('call me at 123-456-7890') == 'call me at **REDACTED**')

    # Credit card tests
    assert(PIIDataScrubber.does_contain_pii('card 1234 5678 9012 3456') == True)
    assert(PIIDataScrubber.scrub_pii('card 1234 5678 9012 3456') == 'card **REDACTED**')

    # Multiple PII
    assert(PIIDataScrubber.scrub_pii('ssn 123-45-6789 and phone 123-456-7890')
           == 'ssn **REDACTED** and phone **REDACTED**')
    
    assert(PIIDataScrubber.does_contain_pii('Hello my name is Maxwell') == False)
    assert(PIIDataScrubber.scrub_pii('Hello my name is Maxwell') == 'Hello my name is Maxwell')

    print("All tests passed!")
    