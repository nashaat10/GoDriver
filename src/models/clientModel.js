import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

clientSchema.pre(/^find/, function (next) {
  this.populate({ path: "admin", match: { role: "admin" }, select: "name" });
  next();
});

const Client = mongoose.model("Client", clientSchema);

export default Client;
