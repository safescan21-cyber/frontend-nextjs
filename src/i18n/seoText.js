// Translated page titles and descriptions per country version: path -> [title, description].
// Pages missing here keep their English text. US/UK only override a few lines that
// talk about India. Used by the server (page.jsx) and the browser (components/Seo.jsx).
import { CITY_HUBS } from '../components/seo/cityHubs';

const fr = {
  '/': ['Food Pharma Machinery | Machines pharma et agroalimentaires', 'Machines pharmaceutiques et agroalimentaires fabriquées en Inde : presses à comprimés, gélules, blisters, remplissage et mélangeurs. Export vers la France.'],
  '/shop': ['Boutique de machines pharmaceutiques et agroalimentaires', 'Achetez presses à comprimés, remplisseuses de gélules, blistéreuses, remplisseuses de liquides et de tubes, mélangeurs et balances de laboratoire. Conception cGMP, pièces et assistance.'],
  '/about': ['À propos de nous', 'Food Pharma Machinery, par PureLine Machinery Pvt. Ltd. (Haridwar, Inde), fournit presses à comprimés, remplisseuses de gélules et lignes de conditionnement aux industries pharmaceutique et alimentaire.'],
  '/products': ['Machines pharmaceutiques et agroalimentaires', 'Découvrez presses à comprimés, remplisseuses de gélules, lignes de blistérisation et de remplissage, mélangeurs, salles blanches et équipements de laboratoire CQ.'],
  '/career': ['Carrières', 'Rejoignez Food Pharma Machinery : ventes, support technique et service pour les machines pharmaceutiques et agroalimentaires.'],
  '/solutions': ['Solutions pour l’industrie pharmaceutique et alimentaire', 'Solutions complètes : formes sèches, traitement des liquides, conditionnement, fabrication stérile, inspection, automatisation et usines clés en main.'],
  '/solutions/solid-dosage': ['Machines pour formes sèches', 'Presses à comprimés, remplisseuses de gélules, granulateurs, pelliculeuses et mélangeurs pour formes orales sèches, conformes cGMP.'],
  '/solutions/liquid-processing': ['Équipements pour liquides', 'Équipements de mélange, de remplissage et de traitement pour sirops, suspensions et produits liquides.'],
  '/solutions/packaging': ['Machines de conditionnement', 'Blistéreuses, remplisseuses de flacons, étiqueteuses et encartonneuses pour des lignes de conditionnement rapides et régulières.'],
  '/solutions/sterile': ['Équipements de fabrication stérile', 'Équipements de remplissage, de scellage et de stérilisation pour la production pharmaceutique stérile et aseptique.'],
  '/solutions/inspection': ['Systèmes d’inspection et de pesage', 'Trieuses pondérales, détecteurs de métaux, inspection par vision et pesage par capteurs de force.'],
  '/solutions/automation': ['Automatisation et contrôle', 'Systèmes PLC, SCADA et contrôle de lots qui automatisent les lignes et conservent des enregistrements complets.'],
  '/solutions/turnkey': ['Projets d’usines clés en main', 'Usines pharmaceutiques et agroalimentaires clés en main : conception, fourniture des machines, installation, validation et formation.'],
  '/solutions/compliance': ['Conformité et validation', 'Assistance cGMP, IQ/OQ/PQ et documentation pour que vos machines et votre usine répondent aux exigences réglementaires.'],
  '/projects': ['Projets réalisés', 'Installations de machines pharmaceutiques et agroalimentaires réalisées, avec les équipements fournis et les résultats obtenus.'],
  '/press': ['Communiqués et actualités', 'Actualités et communiqués de Food Pharma Machinery sur les équipements pharmaceutiques et agroalimentaires.'],
  '/track-order': ['Suivre votre commande', 'Suivez votre commande Food Pharma Machinery avec son numéro : statut, expédition et lien de suivi du transporteur.'],
  '/bulk-quote': ['Demande de devis en volume', 'Demandez un devis pour des machines, pièces et capteurs en volume. Prix dégressifs, export vers la France et réponse sous 1 jour ouvré.'],
  '/testimonials': ['Témoignages clients', 'Ce que disent les fabricants pharmaceutiques et alimentaires de nos machines, APIs, livraisons, installations et assistance. Témoignages réels publiés avec autorisation.'],
  '/pharma-api': ['Principes actifs pharmaceutiques (API)', 'Principes actifs et matières premières pharmaceutiques en grades IP, BP, USP et EP : nom chimique, numéro CAS, composition, COA et FDS. Demandez prix et disponibilité.'],
  '/project-cost-calculator': ['Calculateur de coût de projet pharmaceutique', 'Calculateur gratuit du coût d’une usine pharmaceutique (comprimés, gélules, liquides, pommades, flacons, ampoules, lyophilisés…) : machines, puissance, utilités, CVC et coût total.'],
  '/privacy': ['Politique de confidentialité', 'Comment Food Pharma Machinery collecte, utilise et protège vos données personnelles.'],
  '/contact': ['Contactez-nous', 'Parlez à notre équipe pour un devis, un conseil technique ou des pièces. Appelez, écrivez ou envoyez une demande.'],
  '/products/tablet-press': ['Presses à comprimés', 'Presses à comprimés rotatives haute vitesse et monopoinçon pour la production pharmaceutique.'],
  '/products/capsule-filling': ['Remplisseuses de gélules', 'Remplisseuses automatiques de gélules pour poudres, granulés et liquides.'],
  '/products/blister-packaging': ['Blistéreuses', 'Lignes de blistérisation thermoformée et formage à froid pour comprimés et gélules.'],
  '/products/liquid-filling': ['Remplissage et bouchage de liquides', 'Lignes de remplissage volumétrique et péristaltique pour sirops, suspensions et solutions.'],
  '/products/powder-filling': ['Remplisseuses de poudre', 'Remplisseuses de poudre à vis et sous vide pour applications stériles et non stériles.'],
  '/products/cartoning': ['Encartonneuses', 'Encartonneuses horizontales et verticales pour l’emballage pharmaceutique, nutraceutique et cosmétique.'],
  '/products/labeling': ['Étiqueteuses', 'Systèmes d’étiquetage enveloppant, sur le dessus et impression-pose.'],
  '/products/coating': ['Systèmes de pelliculage', 'Pelliculage, dragéification et turbines entièrement perforées.'],
  '/products/granulation': ['Granulation et mélange', 'Granulateurs à fort cisaillement, sécheurs à lit fluidisé et mélangeurs-granulateurs rapides.'],
  '/products/inspection': ['Inspection et contrôle pondéral', 'Inspection par vision, détecteurs de métaux et trieuses pondérales de haute précision.'],
  '/products/aseptic-filling': ['Lignes de remplissage aseptique', 'Systèmes de remplissage sous isolateur et RABS pour injectables et produits biologiques.'],
  '/products/cleanroom': ['Équipements de salle blanche', 'Unités à flux laminaire, passe-plats et surveillance environnementale.'],
};

const ja = {
  '/': ['Food Pharma Machinery | 製薬・食品機械', 'インド製の製薬・食品加工機械：打錠機、カプセル充填機、ブリスター包装・液体充填ライン、混合機、試験機器、スペアパーツ。日本への輸出に対応。'],
  '/shop': ['製薬・食品加工機械ショップ', '打錠機、カプセル充填機、ブリスター包装機、液体・チューブ充填機、混合機、天秤を購入。cGMP設計、部品とサポート付き。'],
  '/about': ['会社概要', 'Food Pharma Machinery（PureLine Machinery Pvt. Ltd.、インド・ハリドワール）は、製薬・食品メーカーに打錠機、カプセル充填機、包装ラインを供給しています。'],
  '/products': ['製薬・食品機械 製品一覧', '打錠機、カプセル充填機、ブリスター・液体充填ライン、混合機、クリーンルーム、品質管理用試験機器をご覧ください。'],
  '/career': ['採用情報', 'Food Pharma Machineryで、製薬・食品機械の営業、技術サポート、サービスの仕事をしませんか。'],
  '/solutions': ['製薬・食品加工ソリューション', '固形製剤、液体処理、包装、無菌製造、検査、自動化、ターンキープラントのための総合ソリューション。'],
  '/solutions/solid-dosage': ['固形製剤機械', 'cGMP準拠の打錠機、カプセル充填機、造粒機、コーティング機、混合機。'],
  '/solutions/liquid-processing': ['液体処理設備', 'シロップ、懸濁液、液体製品のための混合・充填・処理設備。'],
  '/solutions/packaging': ['包装機械', 'ブリスター包装機、ボトル充填機、ラベラー、カートナーで高速かつ安定した包装ラインを実現。'],
  '/solutions/sterile': ['無菌製造設備', '無菌医薬品製造のための充填、シール、滅菌設備。'],
  '/solutions/inspection': ['検査・計量システム', 'ウェイトチェッカー、金属検出機、画像検査、ロードセル計量システム。'],
  '/solutions/automation': ['自動化・制御システム', 'PLC、SCADA、バッチ制御で生産ラインを自動化し、記録を完全に保持。'],
  '/solutions/turnkey': ['ターンキープラント', '設計から機械供給、据付、バリデーション、トレーニングまで一貫したプラント建設。'],
  '/solutions/compliance': ['コンプライアンス・バリデーション支援', 'cGMP、IQ/OQ/PQ、文書化の支援で規制要件への適合をサポート。'],
  '/projects': ['導入実績', '製薬・食品機械の導入事例と、各お客様への納入設備および成果。'],
  '/press': ['ニュース・プレスリリース', 'Food Pharma Machineryの製薬・食品機械に関するニュースとお知らせ。'],
  '/track-order': ['注文の追跡', '注文番号でFood Pharma Machineryのご注文状況、発送情報、配送追跡をご確認ください。'],
  '/bulk-quote': ['大口注文・お見積り依頼', '機械、スペアパーツ、ロードセルの大口お見積りを依頼。数量割引、日本への輸出、1営業日以内に回答。'],
  '/testimonials': ['お客様の声', '製薬・食品メーカーによる機械、原薬、納品、据付、サポートの評価。許可を得て掲載した実際のお客様の声です。'],
  '/pharma-api': ['医薬品原薬（API）', 'IP・BP・USP・EPグレードの医薬品原薬：化学名、CAS番号、組成、COA、SDS。価格と在庫はお問い合わせください。'],
  '/project-cost-calculator': ['製薬プロジェクト費用計算ツール', '錠剤、カプセル、液剤、軟膏、バイアル、アンプル、凍結乾燥製剤などの工場建設費を無料で概算：機械費、電力、ユーティリティ、空調、総費用。'],
  '/privacy': ['プライバシーポリシー', 'Food Pharma Machineryによる個人情報の収集、利用、保護について。'],
  '/contact': ['お問い合わせ', 'お見積り、技術相談、スペアパーツについて、お電話・メール・フォームでお気軽にご相談ください。'],
  '/products/tablet-press': ['打錠機', '医薬品製造用の高速ロータリー打錠機と単発打錠機。'],
  '/products/capsule-filling': ['カプセル充填機', '粉末、ペレット、液体用の全自動カプセル充填機。'],
  '/products/blister-packaging': ['ブリスター包装機', '錠剤・カプセル用の熱成形および冷間成形ブリスターライン。'],
  '/products/liquid-filling': ['液体充填・キャッピング', 'シロップ、懸濁液、溶液用の容積式・ペリスタルティック充填ライン。'],
  '/products/powder-filling': ['粉末充填機', '無菌・非無菌用途のオーガー式および真空式粉末充填機。'],
  '/products/cartoning': ['カートナー', '医薬品、栄養補助食品、化粧品用の横型・縦型カートナー。'],
  '/products/labeling': ['ラベリングマシン', '巻き付け、天面ラベル、印字貼付けラベリングシステム。'],
  '/products/coating': ['コーティングシステム', 'フィルムコーティング、糖衣、全面多孔式パンシステム。'],
  '/products/granulation': ['造粒・混合', '高速撹拌造粒機、流動層乾燥機、ラピッドミキサーグラニュレーター。'],
  '/products/inspection': ['検査・ウェイトチェック', '画像検査、金属検出機、高精度ウェイトチェッカー。'],
  '/products/aseptic-filling': ['無菌充填ライン', '注射剤・バイオ医薬品向けのアイソレーターおよびRABS充填システム。'],
  '/products/cleanroom': ['クリーンルーム設備', 'クリーンベンチ、パスボックス、環境モニタリング。'],
};

const ko = {
  '/': ['Food Pharma Machinery | 제약 및 식품 기계', '인도산 제약 및 식품 가공 기계: 타정기, 캡슐 충전기, 블리스터 포장 및 액체 충전 라인, 혼합기, 실험 장비와 예비 부품. 한국 수출 가능.'],
  '/shop': ['제약 및 식품 가공 기계 쇼핑', '타정기, 캡슐 충전기, 블리스터 포장기, 액체·튜브 충전기, 혼합기, 실험용 저울을 구매하세요. cGMP 설계, 부품 및 지원 제공.'],
  '/about': ['회사 소개', 'Food Pharma Machinery(PureLine Machinery Pvt. Ltd., 인도 하리드와르)는 제약 및 식품 제조사에 타정기, 캡슐 충전기, 포장 라인을 공급합니다.'],
  '/products': ['제약 및 식품 기계 제품', '타정기, 캡슐 충전기, 블리스터·액체 충전 라인, 혼합기, 클린룸 및 품질관리 실험 장비를 살펴보세요.'],
  '/career': ['채용', 'Food Pharma Machinery에서 제약·식품 기계 영업, 기술 지원, 서비스 업무를 함께하세요.'],
  '/solutions': ['제약 및 식품 가공 솔루션', '고형제, 액체 처리, 포장, 무균 제조, 검사, 자동화, 턴키 플랜트를 위한 종합 솔루션.'],
  '/solutions/solid-dosage': ['고형제 기계', 'cGMP 기준의 타정기, 캡슐 충전기, 과립기, 코팅기, 혼합기.'],
  '/solutions/liquid-processing': ['액체 처리 설비', '시럽, 현탁액, 액체 제품을 위한 혼합·충전·가공 설비.'],
  '/solutions/packaging': ['포장 기계', '블리스터 포장기, 병 충전기, 라벨러, 카토너로 빠르고 안정적인 포장 라인을 구축하세요.'],
  '/solutions/sterile': ['무균 제조 설비', '무균 의약품 생산을 위한 충전, 밀봉, 멸균 설비.'],
  '/solutions/inspection': ['검사 및 계량 시스템', '중량 선별기, 금속 검출기, 비전 검사, 로드셀 계량 시스템.'],
  '/solutions/automation': ['자동화 및 제어 시스템', 'PLC, SCADA, 배치 제어로 생산 라인을 자동화하고 모든 기록을 보관합니다.'],
  '/solutions/turnkey': ['턴키 플랜트 프로젝트', '설계부터 기계 공급, 설치, 밸리데이션, 교육까지 일괄 제공.'],
  '/solutions/compliance': ['규정 준수 및 밸리데이션 지원', 'cGMP, IQ/OQ/PQ, 문서화 지원으로 규제 요건 충족을 돕습니다.'],
  '/projects': ['납품 실적', '제약 및 식품 기계 설치 사례와 고객별 공급 설비 및 성과.'],
  '/press': ['보도자료 및 뉴스', '제약 및 식품 기계에 관한 Food Pharma Machinery의 소식과 보도자료.'],
  '/track-order': ['주문 조회', '주문 번호로 Food Pharma Machinery 주문 상태, 발송 정보, 배송 추적을 확인하세요.'],
  '/bulk-quote': ['대량 주문 및 견적 요청', '기계, 예비 부품, 로드셀 대량 견적을 요청하세요. 수량 할인, 한국 수출, 1영업일 내 답변.'],
  '/testimonials': ['고객 후기', '제약 및 식품 제조사가 전하는 기계, 원료의약품, 배송, 설치, 지원에 대한 실제 후기(동의 후 게재).'],
  '/pharma-api': ['원료의약품(API)', 'IP·BP·USP·EP 등급 원료의약품: 화학명, CAS 번호, 조성, COA, MSDS. 가격과 재고를 문의하세요.'],
  '/project-cost-calculator': ['제약 프로젝트 비용 계산기', '정제, 캡슐, 액제, 연고, 바이알, 앰플, 동결건조 제품 등 제약 공장 비용을 무료로 산출: 기계비, 전력, 유틸리티, HVAC, 총 비용.'],
  '/privacy': ['개인정보 처리방침', 'Food Pharma Machinery의 개인정보 수집, 이용 및 보호 방법.'],
  '/contact': ['문의하기', '견적, 기술 상담, 예비 부품에 대해 전화, 이메일 또는 문의 양식으로 연락하세요.'],
  '/products/tablet-press': ['타정기', '제약 생산용 고속 로터리 타정기 및 단발 타정기.'],
  '/products/capsule-filling': ['캡슐 충전기', '분말, 펠릿, 액체용 자동 캡슐 충전기.'],
  '/products/blister-packaging': ['블리스터 포장기', '정제 및 캡슐용 열성형·냉간성형 블리스터 라인.'],
  '/products/liquid-filling': ['액체 충전 및 캡핑', '시럽, 현탁액, 용액용 정량·연동식 충전 라인.'],
  '/products/powder-filling': ['분말 충전기', '무균 및 비무균 용도의 오거식·진공식 분말 충전기.'],
  '/products/cartoning': ['카토너', '의약품, 건강기능식품, 화장품 포장용 수평·수직 카토너.'],
  '/products/labeling': ['라벨링 기계', '랩어라운드, 상단 라벨, 인쇄 부착 라벨링 시스템.'],
  '/products/coating': ['코팅 시스템', '필름 코팅, 당의 코팅, 전면 다공 팬 시스템.'],
  '/products/granulation': ['과립 및 혼합', '고전단 과립기, 유동층 건조기, 고속 혼합 과립기.'],
  '/products/inspection': ['검사 및 중량 선별', '비전 검사, 금속 검출기, 고정밀 중량 선별기.'],
  '/products/aseptic-filling': ['무균 충전 기계 및 충전 라인', '주사제 및 바이오의약품용 무균 충전 기계: 아이솔레이터·RABS 충전 시스템.'],
  '/products/cleanroom': ['클린룸 설비', '층류 장치, 패스박스, 환경 모니터링 솔루션.'],
};

const enUs = {
  // Search Console (Nov 2026): wording buyers search for ("pharma machinery suppliers")
  '/': ['Food Pharma Machinery | Pharma Machinery Suppliers, USA', 'Pharma machinery suppliers in India exporting to the USA: tablet presses, capsule fillers, pharma packaging and filling machines, mixers and spares.'],
  // Search Console (Nov 2026): this page was shown abroad with a title about India's hubs
  '/pharma-machinery-supplier': ['Pharma Machinery Exporter from India to the USA', 'Pharma machinery made in Haridwar, India and exported to the USA: tablet presses, capsule fillers, packaging and filling lines, spares and quotes.'],
  '/bulk-quote': ['Bulk Pharma Machines – Bulk Order & Quote – USA', 'Bulk pharma machines: request a bulk quote for pharma and food processing machinery and spares. Volume pricing, export shipping to the USA and a reply within 1 business day.'],
};

const enGb = {
  // Search Console (Nov 2026): shown 470 times for 1 click with the old generic title
  '/': ['Food Pharma Machinery | Pharma Machinery Suppliers, UK', 'Pharma machinery suppliers in India exporting to the UK: tablet presses, capsule fillers, pharma packaging and filling machines, mixers and spares.'],
  // Search Console (Nov 2026): this page was shown abroad with a title about India's hubs
  '/pharma-machinery-supplier': ['Pharma Machinery Exporter from India to the UK', 'Pharma machinery made in Haridwar, India and exported to the UK: tablet presses, capsule fillers, packaging and filling lines, spares and quotes.'],
  '/bulk-quote': ['Bulk Pharma Machines – Bulk Order & Quote – UK', 'Bulk pharma machines: request a bulk quote for pharma and food processing machinery and spares. Volume pricing, export shipping to the UK and a reply within 1 business day.'],
};

const enAu = {
  '/': ['Food Pharma Machinery | Pharma & Food Machinery, Australia', 'Pharma and food processing machinery made in India for buyers in Australia: tablet presses, capsule fillers, blister and liquid filling lines, mixers, lab equipment and spares.'],
  // Search Console (Nov 2026): this page was shown abroad with a title about India's hubs
  '/pharma-machinery-supplier': ['Pharma Machinery Exporter from India to Australia', 'Pharma machinery made in Haridwar, India and exported to Australia: tablet presses, capsule fillers, packaging and filling lines, spares and quotes.'],
  '/bulk-quote': ['Bulk Pharma Machines – Bulk Order & Quote – Australia', 'Bulk pharma machines: request a bulk quote for pharma and food processing machinery and spares. Volume pricing, export shipping to Australia quoted, and a reply within 1 business day.'],
};

const ur = {
  '/': ['فوڈ فارما مشینری | فارما اور فوڈ پروسیسنگ مشینری', 'بھارت میں تیار کردہ فارما اور فوڈ پروسیسنگ مشینری: ٹیبلٹ پریس، کیپسول فلر، بلسٹر اور مائع بھرنے کی لائنیں، مکسر، لیب آلات اور پرزے۔'],
  '/shop': ['فارما اور فوڈ پروسیسنگ مشینری کی دکان', 'ٹیبلٹ پریس، کیپسول فلر، بلسٹر پیکنگ، مائع اور ٹیوب بھرنے کی مشینیں، مکسر اور لیب ترازو خریدیں۔ cGMP ڈیزائن، پرزے اور معاونت۔'],
  '/about': ['ہمارے بارے میں', 'فوڈ فارما مشینری (پیور لائن مشینری پرائیویٹ لمیٹڈ، ہری دوار، بھارت) فارما اور فوڈ کمپنیوں کو ٹیبلٹ پریس، کیپسول فلر اور پیکیجنگ لائنیں فراہم کرتی ہے۔'],
  '/products': ['فارما اور فوڈ مشینری کی مصنوعات', 'ٹیبلٹ پریس، کیپسول فلر، بلسٹر اور مائع بھرنے کی لائنیں، مکسر، کلین روم اور کوالٹی کنٹرول لیب آلات دیکھیں۔'],
  '/career': ['ملازمتیں', 'فوڈ فارما مشینری میں سیلز، تکنیکی معاونت اور سروس کے شعبوں میں شامل ہوں۔'],
  '/solutions': ['فارما اور فوڈ پروسیسنگ کے حل', 'ٹھوس خوراک، مائع پروسیسنگ، پیکیجنگ، جراثیم سے پاک پیداوار، معائنہ، آٹومیشن اور ٹرن کی پلانٹس کے مکمل حل۔'],
  '/solutions/solid-dosage': ['ٹھوس خوراک کی مشینری', 'cGMP معیار کے مطابق ٹیبلٹ پریس، کیپسول فلر، گرینولیٹر، کوٹر اور بلینڈر۔'],
  '/solutions/liquid-processing': ['مائع پروسیسنگ آلات', 'شربت، سسپنشن اور مائع مصنوعات کے لیے مکسنگ، بھرائی اور پروسیسنگ آلات۔'],
  '/solutions/packaging': ['پیکیجنگ مشینری', 'بلسٹر پیکنگ، بوتل بھرائی، لیبلنگ اور کارٹوننگ مشینیں جو پیکیجنگ لائنوں کو تیز اور یکساں رکھتی ہیں۔'],
  '/solutions/sterile': ['جراثیم سے پاک پیداوار کے آلات', 'جراثیم سے پاک دوا سازی کے لیے بھرائی، سیلنگ اور اسٹرلائزیشن آلات۔'],
  '/solutions/inspection': ['معائنہ اور وزن کے نظام', 'چیک ویئر، میٹل ڈیٹیکٹر، ویژن معائنہ اور لوڈ سیل وزن کے نظام۔'],
  '/solutions/automation': ['آٹومیشن اور کنٹرول سسٹمز', 'PLC، SCADA اور بیچ کنٹرول جو پیداواری لائنوں کو خودکار بناتے ہیں اور مکمل ریکارڈ رکھتے ہیں۔'],
  '/solutions/turnkey': ['ٹرن کی پلانٹ منصوبے', 'ڈیزائن سے مشینری کی فراہمی، تنصیب، توثیق اور تربیت تک مکمل فارما اور فوڈ پلانٹس۔'],
  '/solutions/compliance': ['تعمیل اور توثیق کی معاونت', 'cGMP، IQ/OQ/PQ اور دستاویزات میں مدد تاکہ آپ کی مشینری ضوابط پر پوری اترے۔'],
  '/projects': ['مکمل شدہ منصوبے', 'فارما اور فوڈ مشینری کی تنصیبات، فراہم کردہ آلات اور حاصل شدہ نتائج۔'],
  '/press': ['پریس ریلیز اور خبریں', 'فارما اور فوڈ پروسیسنگ آلات کے بارے میں فوڈ فارما مشینری کی خبریں اور اعلانات۔'],
  '/track-order': ['اپنا آرڈر ٹریک کریں', 'آرڈر نمبر سے اپنے آرڈر کی صورتحال، روانگی کی تفصیلات اور کورئیر ٹریکنگ دیکھیں۔'],
  '/bulk-quote': ['بڑے آرڈر اور کوٹیشن کی درخواست', 'مشینری، پرزوں اور لوڈ سیلز کا بڑا کوٹیشن طلب کریں۔ مقدار کے مطابق قیمت اور 1 کاروباری دن میں جواب۔'],
  '/testimonials': ['گاہکوں کی آراء', 'فارما اور فوڈ مینوفیکچررز ہماری مشینوں، APIs، ترسیل، تنصیب اور معاونت کے بارے میں کیا کہتے ہیں۔ اجازت کے ساتھ شائع حقیقی آراء۔'],
  '/pharma-api': ['فعال دوا ساز اجزاء (API)', 'IP، BP، USP اور EP گریڈ میں فعال دوا ساز اجزاء: کیمیائی نام، CAS نمبر، ترکیب، COA اور MSDS۔ قیمت اور دستیابی کے لیے انکوائری بھیجیں۔'],
  '/project-cost-calculator': ['فارما منصوبہ لاگت کیلکولیٹر', 'ٹیبلٹ، کیپسول، مائع، مرہم، وائل، ایمپول اور لائیوفلائزڈ مصنوعات کے فارما پلانٹ کی لاگت کا مفت تخمینہ: مشینیں، بجلی، یوٹیلیٹیز، HVAC اور کل لاگت۔'],
  '/privacy': ['رازداری کی پالیسی', 'فوڈ فارما مشینری آپ کا ذاتی ڈیٹا کیسے جمع، استعمال اور محفوظ کرتی ہے۔'],
  '/contact': ['ہم سے رابطہ کریں', 'کوٹیشن، تکنیکی مشورے یا پرزوں کے لیے ہماری ٹیم سے فون، ای میل یا انکوائری کے ذریعے رابطہ کریں۔'],
  '/products/tablet-press': ['ٹیبلٹ پریس مشینیں', 'دوا سازی کے لیے تیز رفتار روٹری اور سنگل پنچ ٹیبلٹ پریس۔'],
  '/products/capsule-filling': ['کیپسول فلنگ مشینیں', 'پاؤڈر، پیلٹس اور مائع کے لیے خودکار کیپسول فلر۔'],
  '/products/blister-packaging': ['بلسٹر پیکیجنگ مشینیں', 'ٹیبلٹس اور کیپسول کے لیے تھرموفارمنگ اور کولڈ فارم بلسٹر لائنیں۔'],
  '/products/liquid-filling': ['مائع بھرائی اور ڈھکن', 'شربت، سسپنشن اور محلول کے لیے والیومیٹرک اور پیریسٹالٹک فلنگ لائنیں۔'],
  '/products/powder-filling': ['پاؤڈر بھرنے کی مشینیں', 'جراثیم سے پاک اور عام استعمال کے لیے آگر اور ویکیوم پاؤڈر فلر۔'],
  '/products/cartoning': ['کارٹوننگ مشینیں', 'فارما، نیوٹراسیوٹیکل اور کاسمیٹک پیکیجنگ کے لیے افقی اور عمودی کارٹونر۔'],
  '/products/labeling': ['لیبلنگ مشینیں', 'ریپ اراؤنڈ، ٹاپ لیبل اور پرنٹ اینڈ اپلائی لیبلنگ سسٹمز۔'],
  '/products/coating': ['کوٹنگ سسٹمز', 'فلم کوٹنگ، شوگر کوٹنگ اور مکمل سوراخ دار پین سسٹمز۔'],
  '/products/granulation': ['گرینولیشن اور مکسنگ', 'ہائی شیئر گرینولیٹر، فلوئڈ بیڈ ڈرائر اور ریپڈ مکسر گرینولیٹر۔'],
  '/products/inspection': ['معائنہ اور وزن جانچ', 'ویژن معائنہ، میٹل ڈیٹیکٹر اور انتہائی درست چیک ویئر۔'],
  '/products/aseptic-filling': ['جراثیم سے پاک فلنگ لائنیں', 'انجیکشن اور بائیولوجکس کے لیے آئسولیٹر اور RABS فلنگ سسٹمز۔'],
  '/products/cleanroom': ['کلین روم آلات', 'لیمینر فلو یونٹس، پاس باکس اور ماحولیاتی نگرانی کے حل۔'],
};

// Pages added later (spares, AMC, hubs, city pages…): their own title in every language, so no
// country version repeats the English title
const MORE = {
  fr: {
    '/spares': ['Pièces détachées par modèle de machine', 'Trouvez les pièces de rechange par modèle : poinçons, matrices, buses de remplissage, courroies et pièces d’usure pour machines pharmaceutiques et alimentaires.'],
    '/amc': ['Contrat de maintenance annuel (AMC) pour machines', 'Contrats de maintenance annuels avec visites préventives planifiées et assistance prioritaire en cas de panne pour vos machines pharmaceutiques et alimentaires.'],
    '/service-request': ['Demande d’intervention – réparation et assistance', 'Signalez une panne ou demandez une intervention : indiquez le modèle, le numéro de série et le problème. Notre équipe vous répond rapidement.'],
    '/factory': ['Notre usine et nos installations', 'L’usine PureLine Machinery à Haridwar : fabrication, essais des machines, expédition et installations chez nos clients.'],
    '/pharma-machinery-supplier': ['Fournisseur de machines pour les pôles pharma indiens', 'Machines, installation, maintenance et pièces détachées pour les usines des principaux pôles pharmaceutiques de l’Inde, depuis notre usine de Haridwar.'],
    '/pharma-plant-checklist': ['Check-list de création d’usine pharma (PDF gratuit)', 'Étapes pour créer une usine pharmaceutique : licences, locaux, utilités, machines et validation. Check-list gratuite en PDF.'],
    '/pharma-machinery': ['Fabricant et fournisseur de machines pharmaceutiques', 'Machines pharmaceutiques fabriquées en Inde : presses à comprimés, remplisseuses de gélules, blistéreuses, remplissage de liquides, granulation et enrobage.'],
    '/food-machinery': ['Machines de transformation et d’emballage alimentaire', 'Machines alimentaires fabriquées en Inde : mélange, broyage, remplissage de poudres et de liquides, ensachage, étiquetage et lignes complètes.'],
  },
  ja: {
    '/spares': ['機種別スペアパーツ', '機種ごとにスペアパーツを検索：杵・臼、充填ノズル、ベルトなど製薬・食品機械の消耗部品。'],
    '/amc': ['年間保守契約（AMC）', '計画的な予防保守訪問と故障時の優先対応を含む、製薬・食品機械の年間保守契約。'],
    '/service-request': ['修理・サービス依頼', '機械の故障や修理のご依頼：機種、シリアル番号、症状をお知らせください。担当チームが迅速に対応します。'],
    '/factory': ['工場と設置実績', 'ハリドワールのPureLine Machinery工場：製造、機械の試験、出荷、そしてお客様先での設置。'],
    '/pharma-machinery-supplier': ['インドの製薬拠点向け機械サプライヤー', 'ハリドワールの自社工場から、インド各地の製薬拠点の工場へ機械、据付、保守、スペアパーツを提供します。'],
    '/pharma-plant-checklist': ['製薬工場立ち上げチェックリスト（無料PDF）', '製薬工場の立ち上げ手順：許認可、建屋、ユーティリティ、機械、バリデーション。無料PDFチェックリスト。'],
    '/pharma-machinery': ['製薬機械メーカー・サプライヤー（インド）', 'インド製の製薬機械：打錠機、カプセル充填機、ブリスター包装機、液体充填機、造粒・コーティング機。'],
    '/food-machinery': ['食品加工・包装機械メーカー（インド）', 'インド製の食品機械：混合、粉砕、粉体・液体充填、袋詰め包装、ラベリング、ライン一式。'],
  },
  ko: {
    '/spares': ['기종별 예비 부품', '기종별 예비 부품 찾기: 펀치·다이, 충전 노즐, 벨트 등 제약·식품 기계 소모 부품.'],
    '/amc': ['연간 유지보수 계약(AMC)', '계획된 예방 정비 방문과 고장 시 우선 지원을 포함한 제약·식품 기계 연간 유지보수 계약.'],
    '/service-request': ['수리·서비스 요청', '기계 고장 및 수리 요청: 기종, 일련번호, 증상을 알려 주시면 담당 팀이 신속히 대응합니다.'],
    '/factory': ['공장 및 설치 사례', '하리드와르 PureLine Machinery 공장: 제조, 기계 시험, 출하 및 고객사 설치.'],
    '/pharma-machinery-supplier': ['인도 제약 클러스터용 기계 공급업체', '하리드와르 자사 공장에서 인도 주요 제약 클러스터의 공장에 기계, 설치, 유지보수, 예비 부품을 공급합니다.'],
    '/pharma-plant-checklist': ['제약 공장 설립 체크리스트(무료 PDF)', '제약 공장 설립 단계: 인허가, 건물, 유틸리티, 기계, 밸리데이션. 무료 PDF 체크리스트.'],
    '/pharma-machinery': ['인도 제약 기계 제조·공급업체', '인도산 제약 기계: 타정기, 캡슐 충전기, 블리스터 포장기, 액체 충전기, 과립·코팅 장비.'],
    '/food-machinery': ['인도 식품 가공·포장 기계 제조업체', '인도산 식품 기계: 혼합, 분쇄, 분체·액체 충전, 파우치 포장, 라벨링 및 전체 라인.'],
  },
  ur: {
    '/spares': ['مشین ماڈل کے مطابق اسپیئر پارٹس', 'ماڈل کے مطابق اسپیئر پارٹس تلاش کریں: پنچ، ڈائی، فلنگ نوزل، بیلٹ اور فارما و فوڈ مشینوں کے دیگر پرزے۔'],
    '/amc': ['سالانہ دیکھ بھال کا معاہدہ (AMC)', 'فارما اور فوڈ مشینوں کے لیے سالانہ معاہدے: طے شدہ احتیاطی وزٹ اور خرابی پر ترجیحی مدد۔'],
    '/service-request': ['سروس کی درخواست – مرمت اور مدد', 'مشین کی خرابی یا مرمت کی درخواست دیں: ماڈل، سیریل نمبر اور مسئلہ بتائیں، ہماری ٹیم جلد رابطہ کرے گی۔'],
    '/factory': ['ہماری فیکٹری اور تنصیبات', 'ہری دوار میں پیور لائن مشینری کی فیکٹری: تیاری، مشینوں کی جانچ، روانگی اور گاہکوں کے ہاں تنصیب۔'],
    '/pharma-machinery-supplier': ['بھارت کے فارما مراکز کے لیے مشینری', 'ہری دوار کی فیکٹری سے بھارت کے بڑے فارما مراکز کے کارخانوں کو مشینیں، تنصیب، دیکھ بھال اور پرزے۔'],
    '/pharma-plant-checklist': ['فارما پلانٹ لگانے کی چیک لسٹ (مفت PDF)', 'فارما پلانٹ لگانے کے مراحل: لائسنس، عمارت، یوٹیلیٹیز، مشینیں اور توثیق۔ مفت PDF چیک لسٹ۔'],
    '/pharma-machinery': ['فارما مشینری بنانے اور فراہم کرنے والے', 'بھارت میں تیار فارما مشینیں: ٹیبلٹ پریس، کیپسول فلر، بلسٹر پیکنگ، مائع بھرائی، گرینولیشن اور کوٹنگ۔'],
    '/food-machinery': ['فوڈ پروسیسنگ اور پیکیجنگ مشینری', 'بھارت میں تیار فوڈ مشینیں: مکسنگ، پیسائی، پاؤڈر اور مائع بھرائی، پاؤچ پیکنگ، لیبلنگ اور مکمل لائنیں۔'],
  },
};
Object.assign(fr, MORE.fr);
Object.assign(ja, MORE.ja);
Object.assign(ko, MORE.ko);
Object.assign(ur, MORE.ur);

// City pages (/pharma-machinery-supplier/<city>): one pattern per language
const CITY_TEXT = {
  fr: (c) => [`Fournisseur de machines pharmaceutiques à ${c}`, `Presses à comprimés, remplisseuses de gélules, blistéreuses et autres machines pour les usines de ${c}. Devis, livraison, installation, maintenance et pièces.`],
  ja: (c) => [`${c}の製薬機械サプライヤー`, `${c}の工場向け打錠機、カプセル充填機、ブリスター包装機などの製薬機械。見積、配送、据付、保守、部品。`],
  ko: (c) => [`${c} 제약 기계 공급업체`, `${c} 공장용 타정기, 캡슐 충전기, 블리스터 포장기 등 제약 기계. 견적, 배송, 설치, 유지보수, 부품.`],
  ur: (c) => [`${c} میں فارما مشینری سپلائر`, `${c} کے کارخانوں کے لیے ٹیبلٹ پریس، کیپسول فلر، بلسٹر پیکنگ اور دیگر فارما مشینیں۔ کوٹیشن، ترسیل، تنصیب، دیکھ بھال اور پرزے۔`],
};
const cityName = (path) => {
  const slug = (String(path).match(/^\/pharma-machinery-supplier\/([^/]+)$/) || [])[1];
  return slug ? CITY_HUBS.find((c) => c.slug === slug)?.city : null;
};

export const SEO_TEXT = { fr, ja, ko, ur, 'en-us': enUs, 'en-gb': enGb, 'en-au': enAu };

// { title, description } for a page in a country version, or null to keep English
export const seoText = (locale, path) => {
  const city = locale && CITY_TEXT[locale] && cityName(path);
  const row = (locale && SEO_TEXT[locale]?.[path]) || (city && CITY_TEXT[locale](city));
  return row ? { title: row[0], description: row[1] } : null;
};

// ── Length and wording rules shared by the server (seo/localizeSeo.js) and the
// browser (components/Seo.jsx), so both always write the same tags ──
const BRAND = 'Food Pharma Machinery';
export const MAX_TITLE = 60; // about what Google shows before "…"
const MAX_DESCRIPTION = 160;

// 'Contact Us' -> 'Contact Us | Food Pharma Machinery', but only when that still fits
export const brandTitle = (title) => {
  if (!title) return title;
  if (title.toLowerCase().includes(BRAND.toLowerCase())) return title;
  const full = `${title} | ${BRAND}`;
  return full.length <= MAX_TITLE ? full : title;
};

// Fit a description to `max` characters: end at a full sentence when one fits,
// otherwise at a word, with "…" (or a full stop when more text follows it)
export const fitDescription = (text, max = MAX_DESCRIPTION, end = '…') => {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const sentence = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('。'), cut.lastIndexOf('۔ '));
  if (sentence > max * 0.6) return cut.slice(0, sentence + 1);
  const words = cut.slice(0, max - 1).replace(/[\s,;:–-]+\S*$/, '').replace(/[\s,;:–-]+(and|or|with|for|the|of|to|in)$/i, '');
  return words + end;
};

// The US, UK and Australia versions are in English like the India site: pages without their
// own text above still get a title and description of their own (not copies)
const REGION = { 'en-us': ['USA', ' Exported to the USA.'], 'en-gb': ['UK', ' Exported to the UK.'], 'en-au': ['Australia', ' For buyers in Australia.'] };
const REGION_SHORT = { 'en-us': 'US', 'en-gb': 'UK', 'en-au': 'AU' };

// Title (without the brand) and description of a page in a country version
export const localizedText = (locale, path, title, description) => {
  const own = seoText(locale, path);
  if (own) return { title: own.title, description: fitDescription(own.description) };
  const region = REGION[locale];
  if (region && title) {
    return {
      // the country only when it still fits (the page's language tags already say which country it is for)
      // (the short code "AU" when the country's name doesn't fit, so the title stays its own)
      title: [`${title} – ${region[0]}`, `${title} – ${REGION_SHORT[locale]}`].find((t) => t.length <= MAX_TITLE) || title,
      description: description ? fitDescription(description, MAX_DESCRIPTION - region[1].length, '.') + region[1] : description,
    };
  }
  return { title, description: description && fitDescription(description) };
};
