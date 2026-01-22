
/**
 * Mock Data for Thock (Keyboard E-commerce)
 * Korean Version
 */

export const mockProducts = [
    {
        id: 1,
        name: "키크론 Q1 Pro 무선 커스텀 기계식 키보드",
        imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop",
        price: 279000,
        nickname: "ThockOfficial",
        category: "KEYBOARD",
        description: "키크론 Q1 Pro는 75% 레이아웃의 프리미엄 기계식 키보드입니다. 노브가 장착되어 있으며, 무선 연결과 QMK/VIA를 지원합니다. 이중 개스킷 디자인으로 최상의 타건감을 제공합니다.",
        stock: 50,
        salePrice: 279000
    },
    {
        id: 2,
        name: "GMK 레드 사무라이 키캡 세트",
        imageUrl: "https://images.unsplash.com/photo-1555532538-dcdbd01d373d?q=80&w=1000&auto=format&fit=crop",
        price: 145000,
        nickname: "KeyCapMaster",
        category: "KEYCAP",
        description: "전설적인 일본 무사의 갑옷에서 영감을 받은 강렬한 레드, 블랙, 골드 컬러의 키캡 세트입니다. 이중사출 ABS 플라스틱으로 내구성이 뛰어나며 선명한 각인을 자랑합니다.",
        stock: 20,
        salePrice: 145000
    },
    {
        id: 3,
        name: "홀리 판다 X 스위치 (택타일) - 35알",
        imageUrl: "https://images.unsplash.com/photo-1629904869392-ae2a682d4d01?q=80&w=1000&auto=format&fit=crop",
        price: 35000,
        nickname: "SwitchGod",
        category: "SWITCH",
        description: "전설적인 홀리 판다의 후속작입니다. 날카롭고 뚜렷한 걸림과 만족스러운 바닥치는 소리를 제공합니다. 피드백을 중요시하는 타이핑 마니아에게 완벽한 선택입니다.",
        stock: 1000,
        salePrice: 35000
    },
    {
        id: 4,
        name: "누피 Air75 V2 로우 프로파일 키보드",
        imageUrl: "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?q=80&w=1000&auto=format&fit=crop",
        price: 189000,
        nickname: "ThockOfficial",
        category: "KEYBOARD",
        description: "초슬림, 고성능. 누피 Air75 V2는 컴팩트한 로우 프로파일 폼팩터에서 기계식 타이핑 경험을 제공하는 완벽한 여행용 키보드입니다.",
        stock: 75,
        salePrice: 189000
    },
    {
        id: 5,
        name: "KBDfans Tofu65 2.0 알루미늄 케이스",
        imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000&auto=format&fit=crop",
        price: 159000,
        nickname: "CustomKing",
        category: "CUSTOM_PART",
        description: "Tofu65 2.0은 다양한 PCB와 호환되는 다재다능한 65% 알루미늄 케이스입니다. 트레이 마운트 또는 O-링 마운트 디자인을 선택하여 타건감을 커스터마이징할 수 있습니다.",
        stock: 12,
        salePrice: 159000
    }
];

export const getMockProductList = () => {
    return mockProducts.map(p => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        price: p.price,
        nickname: p.nickname,
        category: p.category // Added category for filtering
    }));
};

export const getMockProductDetail = (id) => {
    const product = mockProducts.find(p => p.id === parseInt(id));
    if (!product) return null;
    return {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl, // Added imageUrl for Detail Page
        description: product.description,
        stock: product.stock,
        category: product.category,
        sellerNickname: p.nickname
    };
};
