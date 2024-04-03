// const axios = require("axios");

// // Function to add a box
// async function addBox(boxData) {
//   try {
//     const response = await axios.post("http://localhost:3000/boxes", boxData);
//     console.log(response.data);
//   } catch (error) {
//     console.error(error);
//   }
// }

// // Test case to add a box
// const boxData = {
//   width: 10,
//   height: 5,
//   depth: 3,
//   color: "red",
// };

// addBox(boxData);

const app = require("../index"); // path to your index.js file
const Redis = require("redis");

//jest.mock("redis"); // Mock the redisClient module

describe("POST /boxes", () => {
  it("should add a box to the boxes array", async () => {
    // Arrange
    const box = { id: 1, color: "red", size: "large" };
    const boxes = [];
    redisClient.json.get.mockResolvedValue(boxes);
    redisClient.json.set.mockResolvedValue("OK");

    // Act
    const response = await request(app).post("/boxes").send(box);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual([...boxes, box]);
    expect(redisClient.json.get).toHaveBeenCalledWith("boxes", { path: "$" });
    expect(redisClient.json.set).toHaveBeenCalledWith("boxes", ".", [
      ...boxes,
      box,
    ]);
  });
});
