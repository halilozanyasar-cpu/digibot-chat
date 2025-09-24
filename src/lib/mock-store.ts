// Global mock data store
export const mockOrders: any[] = [];

// Mock orders'ı global store'a ekle
const mockOrdersData = [
  {
    _id: 'mock-order-1',
    patientName: 'Ahmet Yılmaz',
    implantDetails: {
      brand: 'Nobel Biocare',
      model: 'NobelActive',
      count: 2,
      positions: ['16', '26']
    },
    prosthesisType: 'Tek diş kron',
    surgicalPlan: {
      approach: 'Flapsız cerrahi',
      boneQuality: 'D2-D1',
      recommendations: ['İmmediate loading']
    },
    status: 'pending',
    guidePrice: 0,
    sleevePrice: 0,
    totalAmount: 0,
    createdAt: new Date().toISOString(),
    userName: 'Dr. Test',
    userEmail: 'halilozanyasar@gmail.com',
    userId: 'mock-user-1'
  },
  {
    _id: 'mock-order-2',
    patientName: 'Ayşe Demir',
    implantDetails: {
      brand: 'Straumann',
      model: 'BLT',
      count: 1,
      positions: ['36']
    },
    prosthesisType: 'Köprü',
    surgicalPlan: {
      approach: 'Flapsız cerrahi',
      boneQuality: 'D2',
      recommendations: ['Delayed loading']
    },
    status: 'pending',
    guidePrice: 0,
    sleevePrice: 0,
    totalAmount: 0,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
    userName: 'Dr. Test 2',
    userEmail: 'halilozanyasar@gmail.com',
    userId: 'mock-user-2'
  }
];

// Mock orders'ı global store'a ekle
if (mockOrders.length === 0) {
  mockOrders.push(...mockOrdersData);
}

