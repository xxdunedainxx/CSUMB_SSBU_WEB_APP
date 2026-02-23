"""
TODO -- FILL OUT AUTHOR COMMENT
  Author:
  Date:
  Synopsis:
"""

# Using python requests library to build HTTP requests
import requests
import json

class SubmitFeedbackIntegrationTests:

    def __init__(self):
        pass

    def run_tests(self):
        self.test_example_good_request()
        self.test_example_bad_request()

    def test_example_good_request(self):
        print("Run test_example_good_request")

        # This is valid, i guess lol
        dictionary_object = {"feedback": "THIS APP SUCKS"}
        r = requests.post(f"http://localhost:80/submitFeedback",
          data=json.dumps(dictionary_object),
          headers={"content-type": "application/json"}
        )

        assert(r.status_code == 200)

    def test_example_bad_request(self):
        print("Run test_example_bad_request")

        # Empty feedback field is invalid
        dictionary_object = {"feedback": ""}
        r = requests.post(f"http://localhost:80/submitFeedback",
                          data=json.dumps(dictionary_object),
                          headers={"content-type": "application/json"}
        )

        assert (r.status_code == 400)

    # TODO -- WHAT OTHER TESTS?

SubmitFeedbackIntegrationTests().run_tests()