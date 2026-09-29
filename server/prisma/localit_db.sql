--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED'
);


ALTER TYPE public."DiscountType" OWNER TO postgres;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'ORDER',
    'SYSTEM',
    'PROMO'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH_ON_DELIVERY',
    'ONLINE_MOCK',
    'STRIPE',
    'RAZORPAY'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'AVAILABLE',
    'OUT_OF_STOCK',
    'DISCONTINUED'
);


ALTER TYPE public."ProductStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'CUSTOMER',
    'SHOP_OWNER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: ShopStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ShopStatus" AS ENUM (
    'OPEN',
    'CLOSED',
    'TEMPORARILY_UNAVAILABLE'
);


ALTER TYPE public."ShopStatus" OWNER TO postgres;

--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SUSPENDED'
);


ALTER TYPE public."VerificationStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id text NOT NULL,
    "userId" text NOT NULL,
    "recipientName" text NOT NULL,
    phone text NOT NULL,
    street text NOT NULL,
    landmark text,
    city text NOT NULL,
    state text NOT NULL,
    pincode text NOT NULL,
    latitude double precision,
    longitude double precision,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    id text NOT NULL,
    "cartId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carts (
    id text NOT NULL,
    "userId" text NOT NULL,
    "shopId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.carts OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "imageUrl" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id text NOT NULL,
    code text NOT NULL,
    "discountType" public."DiscountType" DEFAULT 'PERCENTAGE'::public."DiscountType" NOT NULL,
    "discountAmount" double precision NOT NULL,
    "minOrderAmount" double precision DEFAULT 0.0 NOT NULL,
    "maxDiscount" double precision,
    "expiryDate" timestamp(3) without time zone NOT NULL,
    "usageLimit" integer DEFAULT 100 NOT NULL,
    "usedCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type public."NotificationType" DEFAULT 'ORDER'::public."NotificationType" NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "orderId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "productId" text NOT NULL,
    "productNameSnapshot" text NOT NULL,
    "priceSnapshot" double precision NOT NULL,
    quantity integer NOT NULL,
    subtotal double precision NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "customerId" text NOT NULL,
    "shopId" text NOT NULL,
    "addressId" text NOT NULL,
    "couponId" text,
    subtotal double precision NOT NULL,
    "deliveryFee" double precision DEFAULT 0.0 NOT NULL,
    discount double precision DEFAULT 0.0 NOT NULL,
    tax double precision DEFAULT 0.0 NOT NULL,
    "totalAmount" double precision NOT NULL,
    "orderStatus" public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    "cancellationReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'ONLINE_MOCK'::public."PaymentMethod" NOT NULL,
    "transactionId" text,
    amount double precision NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    metadata text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "categoryId" text NOT NULL,
    name text NOT NULL,
    description text,
    "imageUrl" text,
    price double precision NOT NULL,
    "stockQuantity" integer DEFAULT 0 NOT NULL,
    unit text DEFAULT '1 item'::text NOT NULL,
    status public."ProductStatus" DEFAULT 'AVAILABLE'::public."ProductStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "shopId" text NOT NULL,
    "productId" text,
    "orderId" text NOT NULL,
    rating integer NOT NULL,
    comment text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: shops; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shops (
    id text NOT NULL,
    "ownerId" text NOT NULL,
    "shopName" text NOT NULL,
    description text,
    phone text NOT NULL,
    email text NOT NULL,
    address text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    "openingTime" text DEFAULT '08:00 AM'::text NOT NULL,
    "closingTime" text DEFAULT '10:00 PM'::text NOT NULL,
    status public."ShopStatus" DEFAULT 'OPEN'::public."ShopStatus" NOT NULL,
    "verificationStatus" public."VerificationStatus" DEFAULT 'PENDING'::public."VerificationStatus" NOT NULL,
    "deliveryRadius" double precision DEFAULT 5.0 NOT NULL,
    "deliveryFee" double precision DEFAULT 25.0 NOT NULL,
    "minOrderAmount" double precision DEFAULT 0.0 NOT NULL,
    "imageUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shops OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'CUSTOMER'::public."Role" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, "userId", "recipientName", phone, street, landmark, city, state, pincode, latitude, longitude, "isDefault", "createdAt", "updatedAt") FROM stdin;
4aa9432c-68e8-4036-9a2b-2b3950e4d285	cf90f893-5498-4c96-9b52-dacd31bc53b5	Arun Kumar	9876500010	100, HAL 2nd Stage	Near Metro Station	Bengaluru	Karnataka	560038	12.96388509678251	77.59010096961761	t	2026-09-29 11:57:15.502	2026-09-29 11:57:15.502
9c24af5b-c119-49b9-a152-e5a699a08822	c9c37beb-80d4-44f3-8de7-a668b8567cde	Pooja Hegde	9876500011	105, 100 Feet Rd	Near Metro Station	Bengaluru	Karnataka	560038	12.96654193885562	77.59647028392075	t	2026-09-29 11:57:15.506	2026-09-29 11:57:15.506
0088c597-df25-42dc-8e34-6e364940f5b8	2da7b54d-b439-465d-8514-382682f9b18d	Rahul Dravid	9876500012	110, 12th Main	Near Metro Station	Bengaluru	Karnataka	560038	12.97750682837334	77.59091224405603	t	2026-09-29 11:57:15.509	2026-09-29 11:57:15.509
d8684447-5261-4423-80d2-255919b7178c	8f484c88-c971-41c5-98bf-7c1e1a6a0d8f	Ananya Panday	9876500013	115, CMH Rd	Near Metro Station	Bengaluru	Karnataka	560038	12.97085531608195	77.59867923596485	t	2026-09-29 11:57:15.512	2026-09-29 11:57:15.512
ef66dade-bf40-470b-80cf-b64080f7aea9	9feff773-e81b-4c4a-9b3c-c1a145baab8e	Vikram Singh	9876500014	120, Defence Colony	Near Metro Station	Bengaluru	Karnataka	560038	12.97375750539547	77.59913603168619	t	2026-09-29 11:57:15.514	2026-09-29 11:57:15.514
7e3ed833-31be-45bb-bbfb-63bf2d35d148	b30e201b-699f-4b54-a3f5-233e33b9aca3	Sneha Reddy	9876500015	125, HAL 2nd Stage	Near Metro Station	Bengaluru	Karnataka	560038	12.97705148346884	77.5940632387805	t	2026-09-29 11:57:15.516	2026-09-29 11:57:15.516
8384b45f-4ba5-415b-b6b9-2a1ba08dd8ab	f635dc06-aef1-4de5-894f-001d92c47bec	Karthik Aryan	9876500016	130, 100 Feet Rd	Near Metro Station	Bengaluru	Karnataka	560038	12.97983597272442	77.59996239226268	t	2026-09-29 11:57:15.518	2026-09-29 11:57:15.518
c4dce05b-6efb-4090-9b6f-d8fd71ecd3be	5f458c9a-cf30-4b69-bab1-9cedf3b3202e	Divya Nair	9876500017	135, 12th Main	Near Metro Station	Bengaluru	Karnataka	560038	12.98078062649943	77.6027463071089	t	2026-09-29 11:57:15.521	2026-09-29 11:57:15.521
b7b3435e-18e0-4071-859e-dc90da9d688f	33c5df4b-3a1b-4a5f-b90d-d7f6ce5259ad	Manoj Bajpayee	9876500018	140, CMH Rd	Near Metro Station	Bengaluru	Karnataka	560038	12.97651218242005	77.59837760625443	t	2026-09-29 11:57:15.523	2026-09-29 11:57:15.523
3b667fa2-07ba-4a6c-b968-3d10909ff130	ce6bb471-3e5f-4114-bd38-c5d26d299abe	Neha Sharma	9876500019	145, Defence Colony	Near Metro Station	Bengaluru	Karnataka	560038	12.96316089333122	77.6004181844079	t	2026-09-29 11:57:15.525	2026-09-29 11:57:15.525
736ead59-1445-4aae-a807-b2839f0fc6f7	0e6a8d6b-3657-4272-a33f-1e85c0429801	Rohan Joshi	9876500020	150, HAL 2nd Stage	Near Metro Station	Bengaluru	Karnataka	560038	12.96982978661238	77.59007042344855	t	2026-09-29 11:57:15.526	2026-09-29 11:57:15.526
78114706-48c1-45c0-b6c8-456fceac0a00	61420d22-6053-4acb-a259-cfa1b25c4e66	Priya Mani	9876500021	155, 100 Feet Rd	Near Metro Station	Bengaluru	Karnataka	560038	12.96550422849608	77.5988808312291	t	2026-09-29 11:57:15.528	2026-09-29 11:57:15.528
4c1ba925-395a-4f3f-b707-6e765c7e159f	4b1ee741-6cea-401a-b60a-57a2409bd920	Amitabh Varma	9876500022	160, 12th Main	Near Metro Station	Bengaluru	Karnataka	560038	12.97127979189783	77.58815068654168	t	2026-09-29 11:57:15.53	2026-09-29 11:57:15.53
f91e1562-7358-4747-9195-29643fd5e3ad	dbd5155e-d417-405f-9c72-d28579542e97	Tanvi Shah	9876500023	165, CMH Rd	Near Metro Station	Bengaluru	Karnataka	560038	12.97598524468532	77.59012142817525	t	2026-09-29 11:57:15.531	2026-09-29 11:57:15.531
1829b3eb-1870-4c38-81b3-fc5493b9042c	bd4bad39-4ab2-4724-a045-ca90e265adf6	Suresh Raina	9876500024	170, Defence Colony	Near Metro Station	Bengaluru	Karnataka	560038	12.97774430710822	77.60410524197556	t	2026-09-29 11:57:15.533	2026-09-29 11:57:15.533
d912d702-9959-4592-8b68-f164b060d8f2	a2af3c40-7376-4440-822e-7b0cb0e2fda8	Meera Jasmine	9876500025	175, HAL 2nd Stage	Near Metro Station	Bengaluru	Karnataka	560038	12.97563840665467	77.58547232888857	t	2026-09-29 11:57:15.534	2026-09-29 11:57:15.534
7e9c8530-e6cb-468b-8b5d-b83c51b4157d	e5d6a0f1-1437-4f4a-813f-ca7e640297e4	Harish Kalyan	9876500026	180, 100 Feet Rd	Near Metro Station	Bengaluru	Karnataka	560038	12.97718272719319	77.59597485114648	t	2026-09-29 11:57:15.535	2026-09-29 11:57:15.535
8a018601-20f0-46ca-a65e-074c8e9fe9db	e142ef40-6146-4c64-b895-ec487ebf54b5	Shruti Haasan	9876500027	185, 12th Main	Near Metro Station	Bengaluru	Karnataka	560038	12.96454403183519	77.60224031728721	t	2026-09-29 11:57:15.537	2026-09-29 11:57:15.537
50be3f98-aa48-4e60-a3b2-edd0930d30e6	402811bf-d7d7-4023-846c-69ec299194e7	Gautam Gambhir	9876500028	190, CMH Rd	Near Metro Station	Bengaluru	Karnataka	560038	12.96504085909833	77.59830233150794	t	2026-09-29 11:57:15.54	2026-09-29 11:57:15.54
f4536f2d-6d8e-4747-9ed8-2204374fcee3	dff5bbaa-7c0d-46ef-9a90-2289ef912892	Kavya Maran	9876500029	195, Defence Colony	Near Metro Station	Bengaluru	Karnataka	560038	12.96499931406933	77.5866822182137	t	2026-09-29 11:57:15.542	2026-09-29 11:57:15.542
1053b2a0-8007-4df3-b200-eb253a9e222d	f9e48d18-958f-4394-94a2-52e7172007ac	Naveen Polishetty	9876500030	200, HAL 2nd Stage	Near Metro Station	Bengaluru	Karnataka	560038	12.97853896749946	77.5889437193887	t	2026-09-29 11:57:15.543	2026-09-29 11:57:15.543
59d0dbd2-f03a-4a9b-b513-21d5adf8b375	fa76eac7-48d3-4248-99d0-69e4aa604de1	Bhavana Menon	9876500031	205, 100 Feet Rd	Near Metro Station	Bengaluru	Karnataka	560038	12.97126598649455	77.60395556348298	t	2026-09-29 11:57:15.545	2026-09-29 11:57:15.545
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (id, "cartId", "productId", quantity, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carts (id, "userId", "shopId", "createdAt", "updatedAt") FROM stdin;
8abcdb00-ccb9-4837-9bed-5ae229b93cbf	cf90f893-5498-4c96-9b52-dacd31bc53b5	\N	2026-09-29 12:13:42.553	2026-09-29 12:13:42.553
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, description, "imageUrl", "isActive", "createdAt", "updatedAt") FROM stdin;
668bad09-b067-4e3d-abdb-a0b494e2149b	Dairy & Eggs	dairy-eggs	Fresh milk, curd, paneer, butter, cheese, and farm eggs	\N	t	2026-09-29 11:57:15.546	2026-09-29 11:57:15.546
80b469dd-08cd-438f-93ba-3982512a35b3	Fresh Fruits & Veggies	fruits-vegetables	Fresh farm vegetables, leafy greens, and seasonal fruits	\N	t	2026-09-29 11:57:15.547	2026-09-29 11:57:15.547
da07a963-4c2b-4a5d-be6a-61620a13d80c	Bakery & Breads	bakery-breads	Artisan bread, pav, buns, cookies, and rusk	\N	t	2026-09-29 11:57:15.547	2026-09-29 11:57:15.547
048b60bb-4aff-48f7-9cee-bcad73847480	Atta, Rice & Dals	staples-grains	Whole wheat flour, basmati rice, pulses, and lentils	\N	t	2026-09-29 11:57:15.548	2026-09-29 11:57:15.548
7b9ca90d-b456-49aa-a06d-74b5e6d2b86c	Snacks & Biscuits	snacks-biscuits	Crisps, namkeen, premium cookies, and chocolates	\N	t	2026-09-29 11:57:15.549	2026-09-29 11:57:15.549
62960655-74b6-4367-8cb8-15501c345e28	Beverages & Tea	beverages-tea	Filter coffee, tea bags, fruit juices, and cold drinks	\N	t	2026-09-29 11:57:15.55	2026-09-29 11:57:15.55
ae641ade-0cec-447a-a39c-a739a13a775c	Personal Care	personal-care	Soaps, shampoos, oral hygiene, and skincare essentials	\N	t	2026-09-29 11:57:15.55	2026-09-29 11:57:15.55
44f5f4dc-bdba-40cd-82a9-0cc88519104f	Household Cleaners	household-cleaning	Detergents, floor cleaners, and surface sanitizers	\N	t	2026-09-29 11:57:15.551	2026-09-29 11:57:15.551
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, "discountType", "discountAmount", "minOrderAmount", "maxDiscount", "expiryDate", "usageLimit", "usedCount", "isActive", "createdAt", "updatedAt") FROM stdin;
95995ad7-7680-4c18-ac72-19a78b13e601	WELCOME10	PERCENTAGE	10	150	50	2026-11-28 11:57:15.626	500	0	t	2026-09-29 11:57:15.629	2026-09-29 11:57:15.629
adc32807-008d-4d37-a75b-39dac1f62462	LOCALIT50	FIXED	50	300	\N	2026-11-28 11:57:15.63	200	0	t	2026-09-29 11:57:15.631	2026-09-29 11:57:15.631
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "userId", title, message, type, "isRead", "orderId", "createdAt") FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, "orderId", "productId", "productNameSnapshot", "priceSnapshot", quantity, subtotal) FROM stdin;
5c06fe06-866e-43ca-ac26-2fdda501a37d	93b897de-fc58-432d-a4ec-b1e1a90f817f	0edd188b-60c8-4c56-935a-f602bcc4cd31	Lay’s India’s Magic Masala Potato Chips	20	1	20
68ff56aa-9572-4868-b02b-0b4b95600b3f	93b897de-fc58-432d-a4ec-b1e1a90f817f	0f7ad395-730e-44e6-84e3-fa29da0b4cf3	Britannia 100% Whole Wheat Bread	45	1	45
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, "orderNumber", "customerId", "shopId", "addressId", "couponId", subtotal, "deliveryFee", discount, tax, "totalAmount", "orderStatus", "paymentStatus", "cancellationReason", "createdAt", "updatedAt") FROM stdin;
93b897de-fc58-432d-a4ec-b1e1a90f817f	LOC-20260929-1001	cf90f893-5498-4c96-9b52-dacd31bc53b5	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	4aa9432c-68e8-4036-9a2b-2b3950e4d285	\N	85	20	0	4.25	109.25	DELIVERED	PAID	\N	2026-09-29 11:57:15.634	2026-09-29 11:57:15.634
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, "orderId", "paymentMethod", "transactionId", amount, status, metadata, "createdAt", "updatedAt") FROM stdin;
ba9da0b8-c93a-4501-9e86-da95acde0cfd	93b897de-fc58-432d-a4ec-b1e1a90f817f	ONLINE_MOCK	TXN-SEED-001	109.25	PAID	\N	2026-09-29 11:57:15.64	2026-09-29 11:57:15.64
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, "shopId", "categoryId", name, description, "imageUrl", price, "stockQuantity", unit, status, "createdAt", "updatedAt") FROM stdin;
4d01375f-c575-4074-b08b-c0c629f13466	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	668bad09-b067-4e3d-abdb-a0b494e2149b	Nandini Pasteurised Toned Milk	Pure, fresh toned milk with 3.0% fat and 8.5% SNF.	\N	50	45	500 ml	AVAILABLE	2026-09-29 11:57:15.559	2026-09-29 11:57:15.559
a7abce85-336e-4149-83ae-ae889c32ea41	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	668bad09-b067-4e3d-abdb-a0b494e2149b	Nandini Pasteurised Toned Milk	Pure, fresh toned milk with 3.0% fat and 8.5% SNF.	\N	53	30	500 ml	AVAILABLE	2026-09-29 11:57:15.561	2026-09-29 11:57:15.561
4d8565ae-6e60-4e60-b915-9434a910d9d0	78ce359c-7bfe-4ad5-9a98-448b8b7d4502	668bad09-b067-4e3d-abdb-a0b494e2149b	Nandini Pasteurised Toned Milk	Pure, fresh toned milk with 3.0% fat and 8.5% SNF.	\N	48	20	500 ml	AVAILABLE	2026-09-29 11:57:15.562	2026-09-29 11:57:15.562
31e05078-053b-449c-811e-2a106c5971e7	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	668bad09-b067-4e3d-abdb-a0b494e2149b	Amul Taaza Homogenised Toned Milk	Long shelf life UHT treated toned milk.	\N	72	25	1 Litre	AVAILABLE	2026-09-29 11:57:15.563	2026-09-29 11:57:15.563
1983d062-0d0f-4f33-ae61-c11985e39568	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	668bad09-b067-4e3d-abdb-a0b494e2149b	Amul Taaza Homogenised Toned Milk	Long shelf life UHT treated toned milk.	\N	74	18	1 Litre	AVAILABLE	2026-09-29 11:57:15.564	2026-09-29 11:57:15.564
30989a23-b8d1-4a95-b200-16d30ca0a05e	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	668bad09-b067-4e3d-abdb-a0b494e2149b	Amul Salted Butter	Delicious creamy butter made from fresh cream.	\N	275	15	500 g	AVAILABLE	2026-09-29 11:57:15.565	2026-09-29 11:57:15.565
49d9263f-268f-46e7-a9af-fd084b3a8bb7	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	668bad09-b067-4e3d-abdb-a0b494e2149b	Amul Salted Butter	Delicious creamy butter made from fresh cream.	\N	280	10	500 g	AVAILABLE	2026-09-29 11:57:15.566	2026-09-29 11:57:15.566
3909aa3d-8404-45a5-99ee-48bcbeb57b1f	78ce359c-7bfe-4ad5-9a98-448b8b7d4502	668bad09-b067-4e3d-abdb-a0b494e2149b	Amul Salted Butter	Delicious creamy butter made from fresh cream.	\N	270	12	500 g	AVAILABLE	2026-09-29 11:57:15.567	2026-09-29 11:57:15.567
8433640e-3abf-4f8f-ba93-067830735d08	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	668bad09-b067-4e3d-abdb-a0b494e2149b	Milky Mist Farm Fresh Paneer	Soft and wholesome malai paneer.	\N	110	20	200 g	AVAILABLE	2026-09-29 11:57:15.567	2026-09-29 11:57:15.567
0954f17d-5872-477d-9121-69c6e8e0fa05	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	668bad09-b067-4e3d-abdb-a0b494e2149b	Milky Mist Farm Fresh Paneer	Soft and wholesome malai paneer.	\N	115	14	200 g	AVAILABLE	2026-09-29 11:57:15.568	2026-09-29 11:57:15.568
ceb6520b-1c31-4eae-8530-0860c0d01d59	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	668bad09-b067-4e3d-abdb-a0b494e2149b	Eggoz Farm Fresh Brown Eggs	Naturally laid nutrient-rich brown eggs with bright orange yolk.	\N	85	35	6 pcs pack	AVAILABLE	2026-09-29 11:57:15.569	2026-09-29 11:57:15.569
9db82435-4f1a-4fed-9a76-31882892abae	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	668bad09-b067-4e3d-abdb-a0b494e2149b	Eggoz Farm Fresh Brown Eggs	Naturally laid nutrient-rich brown eggs with bright orange yolk.	\N	90	22	6 pcs pack	AVAILABLE	2026-09-29 11:57:15.571	2026-09-29 11:57:15.571
4e3065a7-359a-4cd7-afa6-bd364e680255	89f905dd-0870-4583-b659-8b5e1731bf8b	668bad09-b067-4e3d-abdb-a0b494e2149b	Eggoz Farm Fresh Brown Eggs	Naturally laid nutrient-rich brown eggs with bright orange yolk.	\N	82	15	6 pcs pack	AVAILABLE	2026-09-29 11:57:15.573	2026-09-29 11:57:15.573
31375336-a584-4291-9f7b-82d3395fbc5f	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	668bad09-b067-4e3d-abdb-a0b494e2149b	Nandini Pure Cow Ghee	Traditional aroma and golden granular texture.	\N	340	18	500 ml	AVAILABLE	2026-09-29 11:57:15.574	2026-09-29 11:57:15.574
b7923f36-f46f-4e15-a3d7-7f364744a1ea	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	668bad09-b067-4e3d-abdb-a0b494e2149b	Nandini Pure Cow Ghee	Traditional aroma and golden granular texture.	\N	345	12	500 ml	AVAILABLE	2026-09-29 11:57:15.575	2026-09-29 11:57:15.575
0f7ad395-730e-44e6-84e3-fa29da0b4cf3	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	da07a963-4c2b-4a5d-be6a-61620a13d80c	Britannia 100% Whole Wheat Bread	Wholesome brown bread packed with dietary fiber.	\N	45	25	400 g	AVAILABLE	2026-09-29 11:57:15.576	2026-09-29 11:57:15.576
c918e7ac-a35c-4112-997f-406e0b0dd504	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	da07a963-4c2b-4a5d-be6a-61620a13d80c	Britannia 100% Whole Wheat Bread	Wholesome brown bread packed with dietary fiber.	\N	48	15	400 g	AVAILABLE	2026-09-29 11:57:15.578	2026-09-29 11:57:15.578
838b6cad-3e5e-4266-a244-b411c0aefa92	78ce359c-7bfe-4ad5-9a98-448b8b7d4502	da07a963-4c2b-4a5d-be6a-61620a13d80c	Britannia 100% Whole Wheat Bread	Wholesome brown bread packed with dietary fiber.	\N	42	30	400 g	AVAILABLE	2026-09-29 11:57:15.579	2026-09-29 11:57:15.579
ddf4cfe6-871d-44af-a4f3-7385406b0711	78ce359c-7bfe-4ad5-9a98-448b8b7d4502	da07a963-4c2b-4a5d-be6a-61620a13d80c	Freshly Baked Garlic Herb Sourdough	Artisanal slow-fermented crusty sourdough with roasted garlic.	\N	140	12	1 loaf (450 g)	AVAILABLE	2026-09-29 11:57:15.581	2026-09-29 11:57:15.581
cc062163-fc05-4253-b8d0-686de4ab533e	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	da07a963-4c2b-4a5d-be6a-61620a13d80c	Soft Ladi Pav	Pillow-soft Mumbai-style bakery pav for bhaji and vada.	\N	25	40	6 pcs pack	AVAILABLE	2026-09-29 11:57:15.582	2026-09-29 11:57:15.582
f425c4e6-341f-4386-9d33-80668e908e99	78ce359c-7bfe-4ad5-9a98-448b8b7d4502	da07a963-4c2b-4a5d-be6a-61620a13d80c	Soft Ladi Pav	Pillow-soft Mumbai-style bakery pav for bhaji and vada.	\N	30	50	6 pcs pack	AVAILABLE	2026-09-29 11:57:15.582	2026-09-29 11:57:15.582
4645c52a-82d9-40ae-a1f4-a66858a04e35	78ce359c-7bfe-4ad5-9a98-448b8b7d4502	da07a963-4c2b-4a5d-be6a-61620a13d80c	Chocolate Chip Brioche Bun	Sweet golden brioche filled with Belgian chocolate chips.	\N	95	18	2 pcs pack	AVAILABLE	2026-09-29 11:57:15.583	2026-09-29 11:57:15.583
17b1523e-0237-44f9-83ef-f7f0ca729c95	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	048b60bb-4aff-48f7-9cee-bcad73847480	Aashirvaad Superior MP Sharbati Atta	100% pure whole wheat grain flour with rich golden rotis.	\N	280	20	5 kg	AVAILABLE	2026-09-29 11:57:15.584	2026-09-29 11:57:15.584
76cb19e0-7073-451f-ab9b-8b96564c029f	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	048b60bb-4aff-48f7-9cee-bcad73847480	Aashirvaad Superior MP Sharbati Atta	100% pure whole wheat grain flour with rich golden rotis.	\N	295	15	5 kg	AVAILABLE	2026-09-29 11:57:15.585	2026-09-29 11:57:15.585
a20acbe0-8e59-4fa9-89d1-2c8fbc1ad3cb	89f905dd-0870-4583-b659-8b5e1731bf8b	048b60bb-4aff-48f7-9cee-bcad73847480	Aashirvaad Superior MP Sharbati Atta	100% pure whole wheat grain flour with rich golden rotis.	\N	275	10	5 kg	AVAILABLE	2026-09-29 11:57:15.586	2026-09-29 11:57:15.586
faf7f221-12cf-4ee9-8bb3-ed6b34512951	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	048b60bb-4aff-48f7-9cee-bcad73847480	Daawat Rozana Super Basmati Rice	Aromatic long slender grain basmati rice for daily cooking.	\N	420	15	5 kg	AVAILABLE	2026-09-29 11:57:15.586	2026-09-29 11:57:15.586
f81899bb-7d5c-45d0-a693-2044675960e0	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	048b60bb-4aff-48f7-9cee-bcad73847480	Daawat Rozana Super Basmati Rice	Aromatic long slender grain basmati rice for daily cooking.	\N	435	8	5 kg	AVAILABLE	2026-09-29 11:57:15.589	2026-09-29 11:57:15.589
d7329313-7db4-47c4-9481-e1948d8f9cd0	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	048b60bb-4aff-48f7-9cee-bcad73847480	Tata Sampann Unpolished Toor Dal	Naturally protein-rich toor dal unpolished without additives.	\N	175	22	1 kg	AVAILABLE	2026-09-29 11:57:15.591	2026-09-29 11:57:15.591
b3dcb5ac-de34-4adc-8791-9c00d4daa294	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	048b60bb-4aff-48f7-9cee-bcad73847480	Tata Sampann Unpolished Toor Dal	Naturally protein-rich toor dal unpolished without additives.	\N	180	16	1 kg	AVAILABLE	2026-09-29 11:57:15.592	2026-09-29 11:57:15.592
18e4a2d5-cf15-4cc8-b788-0d0eb816f5bc	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	048b60bb-4aff-48f7-9cee-bcad73847480	Fortune Sunlite Refined Sunflower Oil	Enriched with Vitamin A and D for light healthy cooking.	\N	135	30	1 Litre pouch	AVAILABLE	2026-09-29 11:57:15.593	2026-09-29 11:57:15.593
0ad868f2-9cfb-4dd2-9987-79fb864ddb0d	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	048b60bb-4aff-48f7-9cee-bcad73847480	Fortune Sunlite Refined Sunflower Oil	Enriched with Vitamin A and D for light healthy cooking.	\N	140	25	1 Litre pouch	AVAILABLE	2026-09-29 11:57:15.594	2026-09-29 11:57:15.594
6e365be7-c02d-479b-bd57-6b03c12d7ba6	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	048b60bb-4aff-48f7-9cee-bcad73847480	Tata Salt Vacuum Evaporated Iodised Salt	India’s trusted national iodised salt.	\N	28	60	1 kg	AVAILABLE	2026-09-29 11:57:15.595	2026-09-29 11:57:15.595
da13939d-3bb8-4691-97a7-6e753c7cd40c	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	048b60bb-4aff-48f7-9cee-bcad73847480	Tata Salt Vacuum Evaporated Iodised Salt	India’s trusted national iodised salt.	\N	28	45	1 kg	AVAILABLE	2026-09-29 11:57:15.596	2026-09-29 11:57:15.596
2e87dbb7-7d33-4d35-8af0-9cffc36da55a	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	80b469dd-08cd-438f-93ba-3982512a35b3	Farm Fresh Hybrid Tomatoes	Plump red ripe tomatoes sourced daily.	\N	32	40	1 kg	AVAILABLE	2026-09-29 11:57:15.596	2026-09-29 11:57:15.596
5285c1bd-5365-47fa-9ca1-9ca81535a2a0	89f905dd-0870-4583-b659-8b5e1731bf8b	80b469dd-08cd-438f-93ba-3982512a35b3	Farm Fresh Hybrid Tomatoes	Plump red ripe tomatoes sourced daily.	\N	38	50	1 kg	AVAILABLE	2026-09-29 11:57:15.597	2026-09-29 11:57:15.597
b573f5cc-aaec-4f8b-b7b1-9140e9d11f78	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	80b469dd-08cd-438f-93ba-3982512a35b3	Baby Potatoes	Firm, clean mini potatoes great for dum aloo.	\N	40	35	1 kg	AVAILABLE	2026-09-29 11:57:15.598	2026-09-29 11:57:15.598
045bb1cc-560b-4a0a-be7f-63200acc1857	89f905dd-0870-4583-b659-8b5e1731bf8b	80b469dd-08cd-438f-93ba-3982512a35b3	Baby Potatoes	Firm, clean mini potatoes great for dum aloo.	\N	45	30	1 kg	AVAILABLE	2026-09-29 11:57:15.6	2026-09-29 11:57:15.6
c085d787-b640-45af-92e6-eebece2d5294	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	80b469dd-08cd-438f-93ba-3982512a35b3	Shimla Royal Delicious Apples	Crisp, sweet, and juicy red mountain apples.	\N	140	15	4 pcs (approx 600g)	AVAILABLE	2026-09-29 11:57:15.601	2026-09-29 11:57:15.601
dac876d3-8268-4254-9293-e59fa48fa0e8	89f905dd-0870-4583-b659-8b5e1731bf8b	80b469dd-08cd-438f-93ba-3982512a35b3	Shimla Royal Delicious Apples	Crisp, sweet, and juicy red mountain apples.	\N	160	20	4 pcs (approx 600g)	AVAILABLE	2026-09-29 11:57:15.601	2026-09-29 11:57:15.601
2a11cdb1-c294-4ec4-9075-e607e6e607c7	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	80b469dd-08cd-438f-93ba-3982512a35b3	Robusta Golden Bananas	Naturally ripened nutrient-dense sweet bananas.	\N	45	30	1 kg (5-6 pcs)	AVAILABLE	2026-09-29 11:57:15.602	2026-09-29 11:57:15.602
9a43db48-d298-4c20-8c4e-47c03cb05b5c	89f905dd-0870-4583-b659-8b5e1731bf8b	80b469dd-08cd-438f-93ba-3982512a35b3	Robusta Golden Bananas	Naturally ripened nutrient-dense sweet bananas.	\N	50	40	1 kg (5-6 pcs)	AVAILABLE	2026-09-29 11:57:15.603	2026-09-29 11:57:15.603
0edd188b-60c8-4c56-935a-f602bcc4cd31	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	7b9ca90d-b456-49aa-a06d-74b5e6d2b86c	Lay’s India’s Magic Masala Potato Chips	Classic spicy wavy potato chips.	\N	20	50	50 g pack	AVAILABLE	2026-09-29 11:57:15.605	2026-09-29 11:57:15.605
0d0a1b80-b163-4826-ba16-afa3346a5587	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	7b9ca90d-b456-49aa-a06d-74b5e6d2b86c	Lay’s India’s Magic Masala Potato Chips	Classic spicy wavy potato chips.	\N	20	35	50 g pack	AVAILABLE	2026-09-29 11:57:15.607	2026-09-29 11:57:15.607
8fe9c784-c03a-4ffe-9a89-faea87b0613c	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	7b9ca90d-b456-49aa-a06d-74b5e6d2b86c	Parle-G Gold Biscuits	Bigger, crispier golden glucose biscuits.	\N	110	25	1 kg family pack	AVAILABLE	2026-09-29 11:57:15.608	2026-09-29 11:57:15.608
fbca304d-68ac-4db9-bc3a-a1f91e6d0742	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	7b9ca90d-b456-49aa-a06d-74b5e6d2b86c	Parle-G Gold Biscuits	Bigger, crispier golden glucose biscuits.	\N	115	18	1 kg family pack	AVAILABLE	2026-09-29 11:57:15.609	2026-09-29 11:57:15.609
57ce6aac-df69-4171-a915-27efa41747b0	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	62960655-74b6-4367-8cb8-15501c345e28	Bru Instant Coffee Powder	Fine roasted blend of robusta and chicory.	\N	195	20	100 g jar	AVAILABLE	2026-09-29 11:57:15.61	2026-09-29 11:57:15.61
82bd569d-5a78-4b34-be55-be289adda1a7	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	62960655-74b6-4367-8cb8-15501c345e28	Bru Instant Coffee Powder	Fine roasted blend of robusta and chicory.	\N	205	12	100 g jar	AVAILABLE	2026-09-29 11:57:15.611	2026-09-29 11:57:15.611
40b8beaa-5f16-491f-8515-3114378177dc	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	62960655-74b6-4367-8cb8-15501c345e28	Red Label Tea with Natural Flavours	Strong, rich aroma Brooke Bond Red Label CTC tea.	\N	260	20	500 g pack	AVAILABLE	2026-09-29 11:57:15.613	2026-09-29 11:57:15.613
644ff3f8-cb7a-4eac-a3e2-241bd950bff9	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	62960655-74b6-4367-8cb8-15501c345e28	Red Label Tea with Natural Flavours	Strong, rich aroma Brooke Bond Red Label CTC tea.	\N	270	15	500 g pack	AVAILABLE	2026-09-29 11:57:15.614	2026-09-29 11:57:15.614
7926ff76-08b9-4529-ba7c-cccf339ed0e0	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	ae641ade-0cec-447a-a39c-a739a13a775c	Dettol Original Germ Protection Bathing Soap	Iconic antiseptic trusted pine fragrance bar soap.	\N	180	25	125 g × 4 bars pack	AVAILABLE	2026-09-29 11:57:15.615	2026-09-29 11:57:15.615
da15245d-e04d-42d8-b918-147fab76a818	5dbe1ebf-d3fb-43ff-a070-ffa2c0132203	ae641ade-0cec-447a-a39c-a739a13a775c	Dettol Original Germ Protection Bathing Soap	Iconic antiseptic trusted pine fragrance bar soap.	\N	175	40	125 g × 4 bars pack	AVAILABLE	2026-09-29 11:57:15.616	2026-09-29 11:57:15.616
8ac82154-e0b6-4fbf-b15d-fe5c2efde995	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	ae641ade-0cec-447a-a39c-a739a13a775c	Colgate Strong Teeth Anticavity Toothpaste	Calcium boost formula for healthy enamel and fresh breath.	\N	125	30	200 g tube	AVAILABLE	2026-09-29 11:57:15.618	2026-09-29 11:57:15.618
537570e6-4fba-4689-b27d-a82225221119	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	ae641ade-0cec-447a-a39c-a739a13a775c	Colgate Strong Teeth Anticavity Toothpaste	Calcium boost formula for healthy enamel and fresh breath.	\N	130	20	200 g tube	AVAILABLE	2026-09-29 11:57:15.619	2026-09-29 11:57:15.619
3e2c8847-4ddb-4e5e-b87c-caff5328edeb	5dbe1ebf-d3fb-43ff-a070-ffa2c0132203	ae641ade-0cec-447a-a39c-a739a13a775c	Colgate Strong Teeth Anticavity Toothpaste	Calcium boost formula for healthy enamel and fresh breath.	\N	120	50	200 g tube	AVAILABLE	2026-09-29 11:57:15.621	2026-09-29 11:57:15.621
26d3e543-30d3-44cd-b1f3-74ace1e8e6de	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	44f5f4dc-bdba-40cd-82a9-0cc88519104f	Surf Excel Quick Wash Detergent Powder	Superior stain removal formula with pleasant fragrance.	\N	155	30	1 kg pack	AVAILABLE	2026-09-29 11:57:15.623	2026-09-29 11:57:15.623
38a72a5c-3832-4698-8ed6-c0e703f8abf4	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	44f5f4dc-bdba-40cd-82a9-0cc88519104f	Surf Excel Quick Wash Detergent Powder	Superior stain removal formula with pleasant fragrance.	\N	160	20	1 kg pack	AVAILABLE	2026-09-29 11:57:15.624	2026-09-29 11:57:15.624
f274e815-acbe-4c4b-8e77-fc8c6c97278b	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	44f5f4dc-bdba-40cd-82a9-0cc88519104f	Vim Dishwash Gel Lemon Scent	Powerful degreasing dish cleaner with natural lemon extract.	\N	145	25	750 ml bottle	AVAILABLE	2026-09-29 11:57:15.625	2026-09-29 11:57:15.625
c5293d5d-1ccd-49da-9850-f302176a4fa3	d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	44f5f4dc-bdba-40cd-82a9-0cc88519104f	Vim Dishwash Gel Lemon Scent	Powerful degreasing dish cleaner with natural lemon extract.	\N	150	15	750 ml bottle	AVAILABLE	2026-09-29 11:57:15.626	2026-09-29 11:57:15.626
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, "customerId", "shopId", "productId", "orderId", rating, comment, "createdAt", "updatedAt") FROM stdin;
f1c0ba59-ab35-4984-9a6c-87fed63f9a5e	cf90f893-5498-4c96-9b52-dacd31bc53b5	2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	0edd188b-60c8-4c56-935a-f602bcc4cd31	93b897de-fc58-432d-a4ec-b1e1a90f817f	5	Fresh toned milk delivered within 18 minutes directly from Daily Fresh Supermarket! Great local service.	2026-09-29 11:57:15.642	2026-09-29 11:57:15.642
\.


--
-- Data for Name: shops; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shops (id, "ownerId", "shopName", description, phone, email, address, latitude, longitude, "openingTime", "closingTime", status, "verificationStatus", "deliveryRadius", "deliveryFee", "minOrderAmount", "imageUrl", "createdAt", "updatedAt") FROM stdin;
2b80cd13-11cf-480c-9ea9-0a2087e1c6cb	a601cb2c-5cd2-442e-9b7e-c6aa62d72b16	Daily Fresh Supermarket	Your trusted neighborhood supermarket since 2012. Fresh farm produce, dairy, and household essentials.	9811000001	dailyfresh@localit.market	42, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru	12.9719	77.6412	07:00 AM	10:30 PM	OPEN	APPROVED	5	20	99	\N	2026-09-29 11:57:15.551	2026-09-29 11:57:15.551
d7af8d13-ddd2-4a9d-b29d-e16ac76100f5	2f547872-9206-4bbc-9364-7a11bb35e062	Sri Krishna Provision Store	Authentic local provision store offering high quality grains, pulses, fresh Nandini dairy, and daily essentials.	9811000002	srikrishna@localit.market	18, 5th Cross, CMH Road, Indiranagar, Bengaluru	12.9782	77.6435	06:30 AM	10:00 PM	OPEN	APPROVED	4.5	15	50	\N	2026-09-29 11:57:15.553	2026-09-29 11:57:15.553
78ce359c-7bfe-4ad5-9a98-448b8b7d4502	4e5845de-072c-4d9c-8ff7-4b578d8ad887	The Artisan Bakery & Cafe	Neighborhood boutique bakery baking oven-fresh sourdough, multi-grain bread, milk buns, and confectionery daily.	9811000003	artisanbaker@localit.market	89, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru	12.9695	77.6385	08:00 AM	10:00 PM	OPEN	APPROVED	6	25	150	\N	2026-09-29 11:57:15.555	2026-09-29 11:57:15.555
89f905dd-0870-4583-b659-8b5e1731bf8b	a601cb2c-5cd2-442e-9b7e-c6aa62d72b16	Green Orchard Organics	Direct from farmers. Certified pesticide-free fresh greens, exotic fruits, and organic cold-pressed oils.	9811000004	greenorchard@localit.market	104, Double Road, Indiranagar, Bengaluru	12.974	77.645	07:30 AM	09:30 PM	OPEN	APPROVED	5.5	30	120	\N	2026-09-29 11:57:15.556	2026-09-29 11:57:15.556
5dbe1ebf-d3fb-43ff-a070-ffa2c0132203	2f547872-9206-4bbc-9364-7a11bb35e062	Indiranagar Medicals & Personal Care	Licensed retail pharmacy providing personal hygiene, baby essentials, and daily wellness items.	9811000005	indiranagarmedicals@localit.market	22, Old Airport Road, Domlur, Bengaluru	12.962	77.64	08:00 AM	11:00 PM	OPEN	APPROVED	5	20	0	\N	2026-09-29 11:57:15.558	2026-09-29 11:57:15.558
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, phone, "passwordHash", role, "isActive", "createdAt", "updatedAt") FROM stdin;
fa2d276b-4d37-4b1b-8733-d419ac3edeea	Platform Administrator	admin@localit.market	9999900000	$2a$10$zta8C0qQIU0F5DahfIfb7OGtU6jmH8t/9uzR6g.Gnc0ZNEXpD7fX6	ADMIN	t	2026-09-29 11:57:15.495	2026-09-29 11:57:15.495
a601cb2c-5cd2-442e-9b7e-c6aa62d72b16	Sunil Sharma	owner1@localit.market	9811000001	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	SHOP_OWNER	t	2026-09-29 11:57:15.497	2026-09-29 11:57:15.497
2f547872-9206-4bbc-9364-7a11bb35e062	Kishore Jain	owner2@localit.market	9811000002	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	SHOP_OWNER	t	2026-09-29 11:57:15.498	2026-09-29 11:57:15.498
4e5845de-072c-4d9c-8ff7-4b578d8ad887	Deepa Rao	owner3@localit.market	9811000003	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	SHOP_OWNER	t	2026-09-29 11:57:15.499	2026-09-29 11:57:15.499
cf90f893-5498-4c96-9b52-dacd31bc53b5	Arun Kumar	customer1@localit.market	9876500010	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.5	2026-09-29 11:57:15.5
c9c37beb-80d4-44f3-8de7-a668b8567cde	Pooja Hegde	customer2@localit.market	9876500011	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.505	2026-09-29 11:57:15.505
2da7b54d-b439-465d-8514-382682f9b18d	Rahul Dravid	customer3@localit.market	9876500012	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.508	2026-09-29 11:57:15.508
8f484c88-c971-41c5-98bf-7c1e1a6a0d8f	Ananya Panday	customer4@localit.market	9876500013	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.51	2026-09-29 11:57:15.51
9feff773-e81b-4c4a-9b3c-c1a145baab8e	Vikram Singh	customer5@localit.market	9876500014	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.513	2026-09-29 11:57:15.513
b30e201b-699f-4b54-a3f5-233e33b9aca3	Sneha Reddy	customer6@localit.market	9876500015	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.515	2026-09-29 11:57:15.515
f635dc06-aef1-4de5-894f-001d92c47bec	Karthik Aryan	customer7@localit.market	9876500016	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.518	2026-09-29 11:57:15.518
5f458c9a-cf30-4b69-bab1-9cedf3b3202e	Divya Nair	customer8@localit.market	9876500017	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.519	2026-09-29 11:57:15.519
33c5df4b-3a1b-4a5f-b90d-d7f6ce5259ad	Manoj Bajpayee	customer9@localit.market	9876500018	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.522	2026-09-29 11:57:15.522
ce6bb471-3e5f-4114-bd38-c5d26d299abe	Neha Sharma	customer10@localit.market	9876500019	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.524	2026-09-29 11:57:15.524
0e6a8d6b-3657-4272-a33f-1e85c0429801	Rohan Joshi	customer11@localit.market	9876500020	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.526	2026-09-29 11:57:15.526
61420d22-6053-4acb-a259-cfa1b25c4e66	Priya Mani	customer12@localit.market	9876500021	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.527	2026-09-29 11:57:15.527
4b1ee741-6cea-401a-b60a-57a2409bd920	Amitabh Varma	customer13@localit.market	9876500022	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.529	2026-09-29 11:57:15.529
dbd5155e-d417-405f-9c72-d28579542e97	Tanvi Shah	customer14@localit.market	9876500023	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.531	2026-09-29 11:57:15.531
bd4bad39-4ab2-4724-a045-ca90e265adf6	Suresh Raina	customer15@localit.market	9876500024	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.532	2026-09-29 11:57:15.532
a2af3c40-7376-4440-822e-7b0cb0e2fda8	Meera Jasmine	customer16@localit.market	9876500025	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.533	2026-09-29 11:57:15.533
e5d6a0f1-1437-4f4a-813f-ca7e640297e4	Harish Kalyan	customer17@localit.market	9876500026	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.535	2026-09-29 11:57:15.535
e142ef40-6146-4c64-b895-ec487ebf54b5	Shruti Haasan	customer18@localit.market	9876500027	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.536	2026-09-29 11:57:15.536
402811bf-d7d7-4023-846c-69ec299194e7	Gautam Gambhir	customer19@localit.market	9876500028	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.539	2026-09-29 11:57:15.539
dff5bbaa-7c0d-46ef-9a90-2289ef912892	Kavya Maran	customer20@localit.market	9876500029	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.541	2026-09-29 11:57:15.541
f9e48d18-958f-4394-94a2-52e7172007ac	Naveen Polishetty	customer21@localit.market	9876500030	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.543	2026-09-29 11:57:15.543
fa76eac7-48d3-4248-99d0-69e4aa604de1	Bhavana Menon	customer22@localit.market	9876500031	$2a$10$UnltEfUq4gW2SlpFfS68v.SAh4VjrzSSUcspGcUKWKZJOc8yESmcK	CUSTOMER	t	2026-09-29 11:57:15.544	2026-09-29 11:57:15.544
\.


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: shops shops_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT shops_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: cart_items_cartId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "cart_items_cartId_productId_key" ON public.cart_items USING btree ("cartId", "productId");


--
-- Name: carts_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "carts_userId_key" ON public.carts USING btree ("userId");


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: coupons_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX coupons_code_key ON public.coupons USING btree (code);


--
-- Name: notifications_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_userId_idx" ON public.notifications USING btree ("userId");


--
-- Name: orders_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_customerId_idx" ON public.orders USING btree ("customerId");


--
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- Name: orders_orderStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_orderStatus_idx" ON public.orders USING btree ("orderStatus");


--
-- Name: orders_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "orders_shopId_idx" ON public.orders USING btree ("shopId");


--
-- Name: payments_orderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "payments_orderId_key" ON public.payments USING btree ("orderId");


--
-- Name: products_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_categoryId_idx" ON public.products USING btree ("categoryId");


--
-- Name: products_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_shopId_idx" ON public.products USING btree ("shopId");


--
-- Name: products_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_status_idx ON public.products USING btree (status);


--
-- Name: reviews_orderId_productId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "reviews_orderId_productId_key" ON public.reviews USING btree ("orderId", "productId");


--
-- Name: shops_latitude_longitude_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shops_latitude_longitude_idx ON public.shops USING btree (latitude, longitude);


--
-- Name: shops_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shops_status_idx ON public.shops USING btree (status);


--
-- Name: shops_verificationStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "shops_verificationStatus_idx" ON public.shops USING btree ("verificationStatus");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_phone_key ON public.users USING btree (phone);


--
-- Name: addresses addresses_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_items cart_items_cartId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES public.carts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_items cart_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: carts carts_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "carts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.shops(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: carts carts_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT "carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_addressId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_couponId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES public.coupons(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.shops(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.shops(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.shops(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shops shops_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT "shops_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

