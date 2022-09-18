# Messari Subgraph Deployment Action

- The purpose of this action is to be used by the Messari subgraph development team for checking subgraph builds on each push to a remote branch in the repository.
- This action works by collecting a list of all changed files, and determining the proper commands to run to build the subgraphs that have had files changed that indicate the need for deployment.
