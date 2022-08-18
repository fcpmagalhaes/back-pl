const generateUniqueID = require("../../utils/generateUniqueId");

describe('Generate Unique ID ', () => {
  it('should generate an unique ID', () => {
    const id = generateUniqueID();

    expect(id).toHaveLength(8);
  });
});