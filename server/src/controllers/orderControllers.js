// import { prisma } from '../config/db.js';

// // ====================== CREATE ORDER (GUEST FRIENDLY) ======================
// export const createOrder = async (req, res) => {
//   try {
//     const { 
//       customerName, 
//       phone, 
//       location, 
//       houseNumber, 
//       deliveryNotes, 
//       paymentMethod, 
//       totalAmount, 
//       orderItems 
//     } = req.body;

//     // Basic validation
//     if (!customerName || !phone || !location || !orderItems?.length) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Missing required fields (name, phone, location, items)" 
//       });
//     }

//     const order = await prisma.order.create({
//       data: {
//         customerName: customerName.trim(),
//         phone: phone.trim(),
//         location: location.trim(),
//         houseNumber: houseNumber ? houseNumber.trim() : '',
//         deliveryNotes: deliveryNotes ? deliveryNotes.trim() : '',
//         paymentMethod: paymentMethod || 'CASH_ON_DELIVERY',
//         totalAmount: parseFloat(totalAmount),
//         status: 'PENDING',
//         orderItems: {
//           create: orderItems.map(item => ({
//             productId: item.productId,
//             quantity: parseInt(item.quantity),
//             price: parseFloat(item.price),
//           })),
//         },
//       },
//       include: {
//         orderItems: {
//           include: { 
//             product: { 
//               select: { id: true, name: true, price: true } 
//             } 
//           }
//         }
//       },
//     });

//     res.status(201).json({ 
//       success: true, 
//       message: 'Order placed successfully!', 
//       data: order 
//     });

//   } catch (error) {
//     console.error("Create Order Error:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Failed to create order' 
//     });
//   }
// };

// // ====================== GET ALL ORDERS (Admin) ======================
// export const getAllOrders = async (req, res) => {
//   try {
//     const orders = await prisma.order.findMany({
//       include: {
//         orderItems: {
//           include: {
//             product: {
//               select: { id: true, name: true, price: true }
//             }
//           }
//         }
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     res.json({ status: 'success', data: orders });
//   } catch (err) {
//     console.error("Get All Orders Error:", err);
//     res.status(500).json({ 
//       status: 'error', 
//       message: err.message 
//     });
//   }
// };

// // ====================== GET SINGLE ORDER ======================
// export const getOrderById = async (req, res) => {
//   try {
//     const order = await prisma.order.findUnique({
//       where: { id: req.params.id },
//       include: {
//         orderItems: {
//           include: { product: true }
//         }
//       },
//     });

//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     res.json({ status: 'success', data: order });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ====================== UPDATE ORDER STATUS ======================
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     const order = await prisma.order.update({
//       where: { id: req.params.id },
//       data: { status },
//     });

//     res.json({ 
//       status: 'success', 
//       message: `Order status updated to ${status}`, 
//       data: order 
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ====================== GET MY ORDERS (For logged-in users) ======================
// export const getMyOrders = async (req, res) => {
//   try {
//     // This one still requires login
//     const orders = await prisma.order.findMany({
//       where: { userId: req.user?.id },
//       include: { 
//         orderItems: { include: { product: true } } 
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     res.json({ status: 'success', data: orders });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

import { notifyAll} from '../service/notificationServices.js';

export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      location,
      houseNumber,
      deliveryNotes,
      paymentMethod,
      totalAmount,
      orderItems,
    } = req.body;

    // Validate required fields
    if (!customerName || !phone || !location || !orderItems?.length) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, phone, location, and items are required',
      });
    }

    const order = {
      customerName:  customerName.trim(),
      phone:         phone.trim(),
      location:      location.trim(),
      houseNumber:   houseNumber?.trim()   || '',
      deliveryNotes: deliveryNotes?.trim() || '',
      paymentMethod: paymentMethod         || 'CASH_ON_DELIVERY',
      totalAmount:   parseFloat(totalAmount),
      orderItems,
    };

    // Send notifications — don't block the response
    notifyAll(order).catch(console.error);

    // Immediately respond to the customer
    res.status(201).json({
      success: true,
      message: 'Order placed successfully! We will confirm via WhatsApp shortly.',
    });

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.',
    });
  }
};