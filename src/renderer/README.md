## Installation of renderer

- ONLY WORKS ON LINUX
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
- Make sure src/renderer/src/main/resources/Dockerfile is built with name tex-renderer-image.
- Run createTempFSforRenderer.sh (located in project root) before trying to start this container
- for local docker compose you need to run localDevCompose.sh, to get the correct GID
