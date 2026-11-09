import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

/**
 * @typedef {Object} UserSchema
 * @description Defines the shape of a User document stored in MongoDB.
 *              Used for authentication, authorization, and lead ownership.
 */
const userSchema = new Schema(
  {
    /**
     * @field name
     * @type {String}
     * @description The full display name of the user (e.g. "Jane Doe").
     *              Must be between 2 and 50 characters; leading/trailing whitespace is stripped.
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name must not exceed 50 characters'],
    },

    /**
     * @field email
     * @type {String}
     * @description The user's unique email address used for login and identification.
     *              Stored in lowercase; validated against a standard email regex.
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Email must be a valid email address',
      },
    },

    /**
     * @field password
     * @type {String}
     * @description The user's hashed password. Plain-text passwords are NEVER persisted.
     *              The pre-save hook automatically hashes the value via bcryptjs before storage.
     *              Minimum 6 characters is enforced at the raw (pre-hash) input level.
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },

    /**
     * @field role
     * @type {String}
     * @description Authorization role controlling what the user can access.
     *              - 'admin' : full CRUD access across all resources
     *              - 'user'  : standard access, restricted to owned resources
     */
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: "Role must be either 'admin' or 'user'",
      },
      default: 'user',
    },

    /**
     * @field isActive
     * @type {Boolean}
     * @description Soft-delete / suspension flag. When set to false the user
     *              is effectively deactivated and should be denied access without
     *              actually removing their record from the database.
     */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    /**
     * Automatically adds `createdAt` and `updatedAt` fields managed by Mongoose.
     * - createdAt : timestamp of the document's first insertion
     * - updatedAt : timestamp of the most recent update
     */
    timestamps: true,
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────

// The `unique: true` on email already creates a unique index.
// Additional compound/sparse indexes can be added here as the app grows.

// ─── Pre-save Middleware ─────────────────────────────────────────────────────

/**
 * @middleware pre('save')
 * @description Automatically hashes the user's password before persisting to MongoDB.
 *              Only runs when the `password` field has been modified (creation or update).
 *              Uses bcryptjs with 10 salt rounds — a good balance between security and performance.
 *
 * @param {Function} next - Call to pass control to the next middleware in the chain.
 */
userSchema.pre('save', async function hashPassword() {
  // Skip hashing if the password field hasn't changed (e.g. updating email only)
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Methods ────────────────────────────────────────────────────────

/**
 * @method comparePassword
 * @description Securely compares a plain-text candidate password against
 *              the stored bcrypt hash. Use this during login to verify credentials.
 *
 * @param {string} candidatePassword - The plain-text password supplied by the user at login.
 * @returns {Promise<boolean>} Resolves to `true` if the passwords match, `false` otherwise.
 *
 * @example
 * const isMatch = await user.comparePassword(req.body.password);
 * if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
 */
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── toJSON Override ─────────────────────────────────────────────────────────

/**
 * @method toJSON
 * @description Overrides the default serialization so that the `password` hash
 *              is never exposed in API responses, logs, or any other JSON output.
 *              Also strips the internal `__v` version key for cleaner payloads.
 *
 * @returns {Object} The plain user object without sensitive fields.
 */
userSchema.methods.toJSON = function toJSON() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// ─── Model & Schema Exports ──────────────────────────────────────────────────

/**
 * @exports userSchema - Raw Mongoose schema (useful for testing or schema composition).
 * @exports User       - Compiled Mongoose model bound to the 'users' collection.
 */
export { userSchema };
export const User = model('User', userSchema);
export default User;
