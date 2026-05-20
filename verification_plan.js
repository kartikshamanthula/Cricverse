// Verification strategy:
// 1. Check if Team.find({ createdBy: userId }) returns only user's teams.
// 2. Check if Team.findOne({ _id: teamId, createdBy: userId }) returns null if teamId isn't owned by userId.
// 3. Verify same for Match and Tournament.

// Since I cannot easily run persistent integration tests without a browser or full request cycle,
// I will verify the code structure and then provide a walkthrough.
