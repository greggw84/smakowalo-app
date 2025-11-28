'use client';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SubscriptionTab;
var react_1 = require("react");
var supabase_js_1 = require("@supabase/supabase-js");
var subscription_overview_1 = require("./subscription-overview");
var lucide_react_1 = require("lucide-react");
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
var supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
var supabase = supabaseUrl && supabaseAnonKey ? (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, storageKey: 'smakowalo_auth' },
}) : null;
function SubscriptionTab() {
    var _this = this;
    var _a = (0, react_1.useState)(true), loading = _a[0], setLoading = _a[1];
    var _b = (0, react_1.useState)(null), subscription = _b[0], setSubscription = _b[1];
    var _c = (0, react_1.useState)(null), weeklyOrder = _c[0], setWeeklyOrder = _c[1];
    var _d = (0, react_1.useState)(null), session = _d[0], setSession = _d[1];
    (0, react_1.useEffect)(function () {
        if (!supabase)
            return;
        var loadData = function () { return __awaiter(_this, void 0, void 0, function () {
            var session_1, userEmail, _a, subs, subsError, _b, subsByEmail, emailError, updateError, orderResponse, orderData, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 10, 11, 12]);
                        setLoading(true);
                        return [4 /*yield*/, supabase.auth.getSession()];
                    case 1:
                        session_1 = (_c.sent()).data.session;
                        if (!session_1)
                            return [2 /*return*/];
                        setSession(session_1);
                        userEmail = session_1.user.email;
                        return [4 /*yield*/, supabase
                                .from('subscriptions')
                                .select('*')
                                .eq('user_id', session_1.user.id)
                                .in('status', ['active', 'trialing', 'past_due', 'incomplete', 'incomplete_expired'])
                                .order('created_at', { ascending: false })
                                .limit(1)
                                .single()
                            // If no subscription found by user_id and we have email, try by customer_email
                            // This handles the case where webhook created subscription before user was linked
                        ];
                    case 2:
                        _a = _c.sent(), subs = _a.data, subsError = _a.error;
                        if (!(!subs && userEmail && (subsError === null || subsError === void 0 ? void 0 : subsError.code) === 'PGRST116')) return [3 /*break*/, 6];
                        return [4 /*yield*/, supabase
                                .from('subscriptions')
                                .select('*')
                                .eq('customer_email', userEmail)
                                .in('status', ['active', 'trialing', 'past_due', 'incomplete', 'incomplete_expired'])
                                .order('created_at', { ascending: false })
                                .limit(1)
                                .single()];
                    case 3:
                        _b = _c.sent(), subsByEmail = _b.data, emailError = _b.error;
                        if (!subsByEmail) return [3 /*break*/, 5];
                        subs = subsByEmail;
                        subsError = null;
                        return [4 /*yield*/, supabase
                                .from('subscriptions')
                                .update({ user_id: session_1.user.id })
                                .eq('id', subsByEmail.id)];
                    case 4:
                        updateError = (_c.sent()).error;
                        if (updateError) {
                            console.error('Failed to link subscription to user:', updateError);
                        }
                        else {
                            console.log('✅ Subscription linked to user account:', {
                                subscription_id: subsByEmail.id,
                                user_id: session_1.user.id
                            });
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        if (emailError && emailError.code !== 'PGRST116') {
                            console.error('Error fetching subscription by email:', emailError);
                        }
                        _c.label = 6;
                    case 6:
                        if (subsError && subsError.code !== 'PGRST116') {
                            console.error('Error fetching subscription:', subsError);
                            console.error('Database error:', subsError.message);
                        }
                        setSubscription(subs);
                        // Debug: Log what we found (dev only)
                        if (process.env.NODE_ENV === 'development') {
                            console.log('📊 Subscription loaded:', {
                                hasUserId: !!session_1.user.id,
                                userEmail: userEmail,
                                found: !!subs,
                                subscription_id: subs === null || subs === void 0 ? void 0 : subs.id,
                                status: subs === null || subs === void 0 ? void 0 : subs.status,
                                linkedByEmail: subs && !subs.user_id
                            });
                        }
                        if (!subs) return [3 /*break*/, 9];
                        return [4 /*yield*/, fetch('/api/subscription/weekly-order', {
                                headers: {
                                    'Authorization': "Bearer ".concat(session_1.access_token)
                                }
                            })];
                    case 7:
                        orderResponse = _c.sent();
                        return [4 /*yield*/, orderResponse.json()];
                    case 8:
                        orderData = _c.sent();
                        if (orderData.success) {
                            setWeeklyOrder(orderData.order);
                        }
                        _c.label = 9;
                    case 9: return [3 /*break*/, 12];
                    case 10:
                        error_1 = _c.sent();
                        console.error('Error loading subscription:', error_1);
                        return [3 /*break*/, 12];
                    case 11:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 12: return [2 /*return*/];
                }
            });
        }); };
        loadData();
    }, []);
    var handlePause = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!subscription || !session)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/subscription/manage', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(session.access_token)
                            },
                            body: JSON.stringify({
                                action: 'pause',
                                subscription_id: subscription.id
                            })
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        alert('✅ Subskrypcja wstrzymana');
                        window.location.reload();
                    }
                    else {
                        throw new Error(result.error);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    alert("\u274C B\u0142\u0105d: ".concat(error_2.message));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleResume = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!subscription || !session)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/subscription/manage', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(session.access_token)
                            },
                            body: JSON.stringify({
                                action: 'resume',
                                subscription_id: subscription.id
                            })
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        alert('✅ Subskrypcja wznowiona');
                        window.location.reload();
                    }
                    else {
                        throw new Error(result.error);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    alert("\u274C B\u0142\u0105d: ".concat(error_3.message));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleCancel = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!subscription || !session)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/subscription/manage', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(session.access_token)
                            },
                            body: JSON.stringify({
                                action: 'cancel',
                                subscription_id: subscription.id
                            })
                        })];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (result.success) {
                        alert('✅ Subskrypcja zostanie anulowana po zakończeniu bieżącego okresu');
                        window.location.reload();
                    }
                    else {
                        throw new Error(result.error);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    alert("\u274C B\u0142\u0105d: ".concat(error_4.message));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    if (loading) {
        return (<div className="flex items-center justify-center py-12">
        <lucide_react_1.Loader2 className="w-8 h-8 animate-spin text-[var(--smakowalo-green-primary)]"/>
      </div>);
    }
    return (<subscription_overview_1.default subscription={subscription} weeklyOrder={weeklyOrder} onPause={handlePause} onResume={handleResume} onCancel={handleCancel} loading={loading}/>);
}
