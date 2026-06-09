// import { prisma } from '../config/db.js';
// import bcrypt from 'bcryptjs';

// const register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         status: "error",
//         message: "Name, email and password are required"
//       });
//     }

//     // Check if user exists
//     const userExists = await prisma.user.findUnique({
//       where: { email }
//     });

//     if (userExists) {
//       return res.status(400).json({
//         status: "error",
//         message: "User with this email already exists"
//       });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = await prisma.user.create({
//   data: {
//     name: "Alice",
//     email: "alice@prisma.io",
//     password: hashedPassword
//   },
// });

//     res.status(201).json({
//       status: "success",
//       data: { 
//         id: newUser.id,
//         name: newUser.name,
//         email: newUser.email,
//        }
//     });

//   } catch (error) {
//     console.error("Registration Error:", error);
    
//     // Better error message for connection issues
//     if (error.code === 'ECONNREFUSED' || error.message.includes('Can\'t reach database')) {
//       return res.status(500).json({
//         status: "error",
//         message: "Database connection error. Please try again later."
//       });
//     }

//     res.status(500).json({
//       status: "error",
//       message: "Registration failed"
//     });
//   }
//   //logic for registration
//   const { name, email, password } = req.body;

//   if (!name || !email || !password) {
//     return res.status(400).json({
//       status: "error",
//       message: "Name, email and password are required"
//     });
//   }
// };

// export { register };

import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Name, email and password are required"
      });
    }

    // Simple registration (no duplicate check for now)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: { user }
    });

  } catch (error) {
    console.error("Registration Error:", error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        status: "error",
        message: "User with this email already exists"
      });
    }

    res.status(500).json({
      status: "error",
      message: "Registration failed - Database connection issue"
    });
    
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      }
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials"
      });
    }

    res.json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      status: "error",
      message: "Login failed"
    });
  }
}; 

export { register, login };