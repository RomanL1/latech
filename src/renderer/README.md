## Installation of renderer

- Make sure to have the latest version of gradle installed
- Make sure to have java 25 installed
- Open the project in intellij idea (vscode should also work but not verified)
- intellij idea specific steps:
    - Sync all gradle projects
    - Run the project from the run button
- Or run the following command:
    - `./gradlew clean build`
    - `./gradlew bootRun`
- The renderer should be running on localhost:9090
- Run `./gradlew generateProto` to generate the grpc code
- Make sure you have Docker installed
- navigate to root of project and run `docker build -t tex-renderer-image .`
