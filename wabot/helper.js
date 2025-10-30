/**
 * Convert stream to base64 encoded string
 * @param {*} stream
 * @returns
 */
function streamToBase64(stream) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    stream.on("data", (chunk) => {
      buffers.push(chunk);
    });

    stream.once("end", () => {
      let buffer = Buffer.concat(buffers);
      resolve(buffer.toString("base64"));
    });

    stream.once("error", (err) => {
      reject(err);
    });
  });
}

module.exports = {
  streamToBase64,
};
