# IntelliJ Project Setup for Java (API & Renderer)

To ensure everyone has the same Java code style and automatic formatting on save for the `api` and `renderer` projects, please follow these steps:

## 1. Shared Configuration (Already Done)
The following files have been added to `src/api` and `src/renderer`:
- `.editorconfig`: Specific rules for `.java` files (Indent 4).
- `.idea/codeStyles/Project.xml`: IntelliJ-specific Java formatting rules.
- `.idea/codeStyles/codeStyleConfig.xml`: Forces IntelliJ to use the Project-level scheme.

## 2. One-Time Setup (Required for each worker)
IntelliJ does not share "Action on Save" settings via Git. To enable Format on Save:

1. Open **Settings** (macOS: `Cmd+,`).
2. Go to **Tools** > **Actions on Save**.
3. Check **Reformat code**.
4. (Optional) Check **Optimize imports**.
5. Click **Apply**.

## 3. Verify Java Code Style
Ensure that IntelliJ is using the **Project** scheme:
1. Go to **Editor** > **Code Style** > **Java**.
2. Look at the **Scheme** dropdown. It should say **Project**. 
