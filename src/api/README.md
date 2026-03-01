## Installation of api

- Make sure to have the latest version of gradle installed
- Make sure to have docker desktop installed and running
- Make sure to have java 25 installed
- Open the project in intellij idea (vscode should also work but not verified)
- intellij idea specific steps:
    - Sync all gradle projects
    - Run the project from the run button
- Or run the following command:
    - `./gradlew clean build`
    - `./gradlew bootRun`
- The api should be running on localhost:8080
- Run `./gradlew generateProto` to generate the grpc code
