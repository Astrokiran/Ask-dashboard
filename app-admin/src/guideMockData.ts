
export interface Guide {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  email: string;
  phone: string;
  orders:number;
  altPhone?: string;
  specialization?: string;
  skills: string[];
  languages: string[];
  experience: number;
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  onboardedDate: Date;
  // KYC Details
  kyc: {
    aadhaar: {
      front: { src: string; title: string };
      back: { src: string; title: string };
    };
    pan: {
      front: { src: string; title: string };
      back: { src: string; title: string };
    };
    bank: {
      account_holder_name: string;
      account_number: string;
      bank_name: string;
      ifsc_code: string;
    };
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
}

export const guides: Guide[] = [
    {
        id: 1,
        name: 'Aarav Sharma',
        avatar: 'https://i.pravatar.cc/150?img=1',
        status: 'online',
        email: 'aarav.sharma@example.com',
        phone: '9876543210',
        orders: 56,
        specialization: 'Vedic Astrology',
        skills: ['Vedic Astrology', 'Numerology'],
        languages: ['Hindi', 'English'],
        experience: 10,
        address: {
            line1: '123 Jyotish Lane',
            city: 'Varanasi',
            state: 'Uttar Pradesh',
            pincode: '221001',
            country: 'India',
        },
        onboardedDate: new Date('2022-08-15T09:00:00Z'),
        kyc: {
            aadhaar: {
                front: { src: '/adharfront.png', title: 'Aadhaar Card (Front)' },
                back: { src: '/adharback.png', title: 'Aadhaar Card (Back)' },
            },
            pan: {
                front: { src: '/panfront.png', title: 'PAN Card (Front)' },
                back: { src: '/panback.png', title: 'PAN Card (Back)' },
            },
            bank: {
                account_holder_name: 'Aarav Sharma',
                account_number: '123456789012',
                bank_name: 'State Bank of India',
                ifsc_code: 'SBIN0001234',
            },
            verificationStatus: 'verified',
        },
    },
    
];