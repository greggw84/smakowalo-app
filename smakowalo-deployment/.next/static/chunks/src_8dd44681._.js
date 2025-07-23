(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/lib/supabase.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "createSupabaseClient": (()=>createSupabaseClient),
    "createSupabaseComponentClient": (()=>createSupabaseComponentClient),
    "supabase": (()=>supabase)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$auth$2d$helpers$2d$nextjs$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/auth-helpers-nextjs/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-client] (ecmascript) <locals>");
;
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://quqqpixujzxujauhessa.supabase.co") || 'https://placeholder.supabase.co';
const supabaseAnonKey = ("TURBOPACK compile-time value", "twoj-prawdziwy-anon-key-tutaj") || 'placeholder-key';
const createSupabaseClient = ()=>{
    if (!supabaseUrl.includes('placeholder') && !supabaseAnonKey.includes('placeholder') && !supabaseAnonKey.includes('twoj-prawdziwy') && supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 20) {
        try {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
        } catch (error) {
            console.error('Supabase client creation failed:', error);
            return null;
        }
    }
    // Return null for placeholder/invalid configuration
    console.log('Supabase not configured properly, using mock data');
    return null;
};
const createSupabaseComponentClient = ()=>{
    if (!supabaseUrl.includes('placeholder') && !supabaseAnonKey.includes('placeholder') && !supabaseAnonKey.includes('twoj-prawdziwy') && supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 20) {
        try {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$auth$2d$helpers$2d$nextjs$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClientComponentClient"])();
        } catch (error) {
            console.error('Supabase component client creation failed:', error);
            return null;
        }
    }
    // Return null for placeholder/invalid configuration
    console.log('Supabase not configured properly for components');
    return null;
};
const supabase = createSupabaseClient();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "AuthProvider": (()=>AuthProvider),
    "useAuth": (()=>useAuth)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bippy$2f$dist$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/bippy/dist/jsx-dev-runtime.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bippy$2f$dist$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/bippy/dist/jsx-dev-runtime.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createSupabaseComponentClient"])();
    // Check if Supabase is configured
    const isConfigured = ("TURBOPACK compile-time value", "https://quqqpixujzxujauhessa.supabase.co") && !("TURBOPACK compile-time value", "https://quqqpixujzxujauhessa.supabase.co").includes('placeholder');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            if (!isConfigured || !supabase) {
                setLoading(false);
                return;
            }
            // Get initial session
            const getInitialSession = {
                "AuthProvider.useEffect.getInitialSession": async ()=>{
                    try {
                        const { data: { session }, error } = await supabase.auth.getSession();
                        if (error) {
                            console.error('Error getting session:', error);
                        } else {
                            setSession(session);
                            setUser(session?.user ?? null);
                        }
                    } catch (error) {
                        console.error('Supabase not available:', error);
                    }
                    setLoading(false);
                }
            }["AuthProvider.useEffect.getInitialSession"];
            getInitialSession();
            // Listen for auth changes
            try {
                const { data: { subscription } } = supabase.auth.onAuthStateChange({
                    "AuthProvider.useEffect": async (event, session)=>{
                        setSession(session);
                        setUser(session?.user ?? null);
                        setLoading(false);
                    }
                }["AuthProvider.useEffect"]);
                return ({
                    "AuthProvider.useEffect": ()=>subscription.unsubscribe()
                })["AuthProvider.useEffect"];
            } catch (error) {
                console.error('Supabase auth subscription failed:', error);
            }
        }
    }["AuthProvider.useEffect"], [
        supabase,
        isConfigured
    ]);
    const signUp = async (email, password, userData)=>{
        if (!isConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });
        if (error) {
            throw error;
        }
        // Create profile
        if (data.user) {
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                email: data.user.email || email,
                first_name: userData.firstName,
                last_name: userData.lastName,
                phone: userData.phone,
                newsletter_subscribed: userData.newsletter || false
            });
            if (profileError) {
                console.error('Error creating profile:', profileError);
            }
        }
        return {
            data,
            error
        };
    };
    const signIn = async (email, password)=>{
        if (!isConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) {
            throw error;
        }
        return {
            data,
            error
        };
    };
    const signOut = async ()=>{
        if (!isConfigured || !supabase) {
            throw new Error('Supabase is not configured');
        }
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
    };
    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bippy$2f$dist$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/AuthContext.tsx",
        lineNumber: 148,
        columnNumber: 10
    }, this);
}
_s(AuthProvider, "sIDOCMze9iVqwxkgWIhOu8vskSI=");
_c = AuthProvider;
const useAuth = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/contexts/CartContext.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "CartProvider": (()=>CartProvider),
    "useCart": (()=>useCart)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bippy$2f$dist$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/bippy/dist/jsx-dev-runtime.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bippy$2f$dist$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/bippy/dist/jsx-dev-runtime.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
const CartContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function CartProvider({ children }) {
    _s();
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Load cart from localStorage on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CartProvider.useEffect": ()=>{
            try {
                const savedCart = localStorage.getItem('smakowalo-cart');
                if (savedCart) {
                    setItems(JSON.parse(savedCart));
                }
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
            } finally{
                setIsLoading(false);
            }
        }
    }["CartProvider.useEffect"], []);
    // Save cart to localStorage whenever items change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CartProvider.useEffect": ()=>{
            if (!isLoading) {
                try {
                    localStorage.setItem('smakowalo-cart', JSON.stringify(items));
                } catch (error) {
                    console.error('Error saving cart to localStorage:', error);
                }
            }
        }
    }["CartProvider.useEffect"], [
        items,
        isLoading
    ]);
    const addItem = (newItem, quantity = 1)=>{
        setItems((prevItems)=>{
            const existingItem = prevItems.find((item)=>item.id === newItem.id);
            if (existingItem) {
                // Update quantity if item already exists
                return prevItems.map((item)=>item.id === newItem.id ? {
                        ...item,
                        quantity: item.quantity + quantity
                    } : item);
            }
            // Add new item
            return [
                ...prevItems,
                {
                    ...newItem,
                    quantity
                }
            ];
        });
    };
    const removeItem = (id)=>{
        setItems((prevItems)=>prevItems.filter((item)=>item.id !== id));
    };
    const updateQuantity = (id, quantity)=>{
        if (quantity <= 0) {
            removeItem(id);
            return;
        }
        setItems((prevItems)=>prevItems.map((item)=>item.id === id ? {
                    ...item,
                    quantity
                } : item));
    };
    const clearCart = ()=>{
        setItems([]);
    };
    const totalItems = items.reduce((sum, item)=>sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item)=>sum + item.price * item.quantity, 0);
    const value = {
        items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isLoading
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bippy$2f$dist$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jsxDEV"])(CartContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/CartContext.tsx",
        lineNumber: 109,
        columnNumber: 10
    }, this);
}
_s(CartProvider, "ck3fcARPIRqzu6cRalC4Rw+pTvI=");
_c = CartProvider;
const useCart = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
_s1(useCart, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "CartProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/ClientBody.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>ClientBody)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bippy$2f$dist$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/bippy/dist/jsx-dev-runtime.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bippy$2f$dist$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/bippy/dist/jsx-dev-runtime.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$CartContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/CartContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function ClientBody({ children }) {
    _s();
    // Remove any extension-added classes during hydration
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClientBody.useEffect": ()=>{
            // This runs only on the client after hydration
            document.body.className = "antialiased";
        }
    }["ClientBody.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bippy$2f$dist$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AuthProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bippy$2f$dist$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$CartContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bippy$2f$dist$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["jsxDEV"])("div", {
                className: "antialiased",
                children: children
            }, void 0, false, {
                fileName: "[project]/src/app/ClientBody.tsx",
                lineNumber: 21,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/ClientBody.tsx",
            lineNumber: 20,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/ClientBody.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_s(ClientBody, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = ClientBody;
var _c;
__turbopack_context__.k.register(_c, "ClientBody");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_8dd44681._.js.map