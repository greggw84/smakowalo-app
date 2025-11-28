"use strict";
/**
 * Consolidated Stripe Webhook Handler
 * ===========================================
 * This is the CANONICAL webhook endpoint for all Stripe events.
 * Webhook URL: https://your-domain.com/api/webhooks/stripe
 *
 * Handles:
 * - Subscription lifecycle (created, updated, deleted)
 * - Payment events (succeeded, failed)
 * - Order creation from checkout completion
 * - Email notifications
 * - Database synchronization
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.POST = POST;
var server_1 = require("next/server");
var stripe_1 = require("stripe");
var supabase_js_1 = require("@supabase/supabase-js");
var email_1 = require("@/lib/email");
// Initialize Stripe
var stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
});
// Initialize Supabase with service role key for admin operations
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// Webhook secret from Stripe Dashboard
var webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
// Helper: UUID validation regex
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Logging helper
function logWebhook(level, message, data) {
    var emoji = {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        warn: '⚠️'
    };
    var prefix = emoji[level];
    console.log("".concat(prefix, " [Webhook] ").concat(message), data ? JSON.stringify(data, null, 2) : '');
}
/**
 * POST handler for Stripe webhook events
 * This must use raw body for signature verification
 */
function POST(req) {
    return __awaiter(this, void 0, void 0, function () {
        var body, signature, event, supabase, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logWebhook('info', 'Webhook received');
                    // Verify environment variables
                    if (!webhookSecret) {
                        logWebhook('error', 'STRIPE_WEBHOOK_SECRET not configured');
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })];
                    }
                    if (!supabaseUrl || !supabaseServiceKey) {
                        logWebhook('error', 'Supabase not configured');
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Database not configured' }, { status: 500 })];
                    }
                    return [4 /*yield*/, req.text()];
                case 1:
                    body = _b.sent();
                    signature = req.headers.get('stripe-signature');
                    if (!signature) {
                        logWebhook('error', 'No Stripe signature in request headers');
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'No signature' }, { status: 400 })];
                    }
                    try {
                        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
                        logWebhook('success', "Webhook signature verified: ".concat(event.type), { id: event.id });
                    }
                    catch (err) {
                        logWebhook('error', 'Webhook signature verification failed', { error: err.message });
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Webhook verification failed: ".concat(err.message) }, { status: 400 })];
                    }
                    supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 19, , 20]);
                    _a = event.type;
                    switch (_a) {
                        case 'checkout.session.completed': return [3 /*break*/, 3];
                        case 'customer.subscription.created': return [3 /*break*/, 5];
                        case 'customer.subscription.updated': return [3 /*break*/, 7];
                        case 'customer.subscription.deleted': return [3 /*break*/, 9];
                        case 'invoice.payment_succeeded': return [3 /*break*/, 11];
                        case 'invoice.payment_failed': return [3 /*break*/, 13];
                        case 'customer.subscription.trial_will_end': return [3 /*break*/, 15];
                    }
                    return [3 /*break*/, 17];
                case 3: return [4 /*yield*/, handleCheckoutSessionCompleted(event.data.object, supabase)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 5: return [4 /*yield*/, handleSubscriptionCreated(event.data.object, supabase)];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 7: return [4 /*yield*/, handleSubscriptionUpdated(event.data.object, supabase)];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 9: return [4 /*yield*/, handleSubscriptionDeleted(event.data.object, supabase)];
                case 10:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 11: return [4 /*yield*/, handleInvoicePaymentSucceeded(event.data.object, supabase)];
                case 12:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 13: return [4 /*yield*/, handleInvoicePaymentFailed(event.data.object, supabase)];
                case 14:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 15: return [4 /*yield*/, handleTrialWillEnd(event.data.object, supabase)];
                case 16:
                    _b.sent();
                    return [3 /*break*/, 18];
                case 17:
                    logWebhook('warn', "Unhandled event type: ".concat(event.type));
                    _b.label = 18;
                case 18:
                    logWebhook('success', "Event ".concat(event.type, " processed successfully"));
                    return [2 /*return*/, server_1.NextResponse.json({ received: true, processed: event.type })];
                case 19:
                    error_1 = _b.sent();
                    logWebhook('error', 'Error processing webhook event', {
                        type: event.type,
                        error: error_1.message,
                        stack: error_1.stack
                    });
                    // Return 500 to tell Stripe to retry
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Webhook processing failed', details: error_1.message }, { status: 500 })];
                case 20: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle checkout.session.completed event
 * Creates both subscription and initial order records
 */
function handleCheckoutSessionCompleted(session, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var customerId, subscriptionId, userId, customerEmail, subscription, err_1, mealPlanConfig, people, days, deliveryDay, planType, subscriptionData, _a, users, usersError, user, profile, _b, subError, subData;
        var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    logWebhook('info', 'Processing checkout.session.completed', { sessionId: session.id });
                    // Only process subscription checkouts
                    if (session.mode !== 'subscription') {
                        logWebhook('info', 'Skipping non-subscription checkout');
                        return [2 /*return*/];
                    }
                    customerId = session.customer;
                    subscriptionId = session.subscription;
                    userId = (_c = session.metadata) === null || _c === void 0 ? void 0 : _c.user_id;
                    // Fallback to client_reference_id only if it looks like a UUID
                    if (!userId && session.client_reference_id) {
                        // Validate that client_reference_id looks like a UUID
                        if (UUID_REGEX.test(session.client_reference_id)) {
                            userId = session.client_reference_id;
                            logWebhook('info', 'Using client_reference_id as user_id', { hasUserId: true });
                        }
                        else {
                            logWebhook('warn', 'client_reference_id is not a valid UUID', {
                                format: 'invalid'
                            });
                        }
                    }
                    customerEmail = ((_d = session.customer_details) === null || _d === void 0 ? void 0 : _d.email) || session.customer_email;
                    if (!subscriptionId) {
                        logWebhook('error', 'No subscription ID in checkout session');
                        return [2 /*return*/];
                    }
                    if (!subscriptionId.startsWith('sub_')) {
                        logWebhook('error', 'Invalid Stripe subscription ID format', { subscriptionId: subscriptionId });
                        return [2 /*return*/];
                    }
                    _o.label = 1;
                case 1:
                    _o.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, stripe.subscriptions.retrieve(subscriptionId)];
                case 2:
                    subscription = _o.sent();
                    logWebhook('success', 'Retrieved subscription from Stripe', { subscriptionId: subscriptionId });
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _o.sent();
                    logWebhook('error', 'Failed to retrieve subscription', { error: err_1.message });
                    throw err_1;
                case 4:
                    mealPlanConfig = ((_e = session.metadata) === null || _e === void 0 ? void 0 : _e.meal_plan_config)
                        ? JSON.parse(session.metadata.meal_plan_config)
                        : {};
                    people = Number.parseInt(((_f = session.metadata) === null || _f === void 0 ? void 0 : _f.number_of_people) || '2');
                    days = Number.parseInt(((_g = session.metadata) === null || _g === void 0 ? void 0 : _g.number_of_days) || '3');
                    deliveryDay = ((_h = session.metadata) === null || _h === void 0 ? void 0 : _h.delivery_day) || 'tuesday';
                    planType = ((_j = session.metadata) === null || _j === void 0 ? void 0 : _j.plan_type) || 'weekly';
                    subscriptionData = {
                        stripe_customer_id: customerId,
                        stripe_subscription_id: subscriptionId,
                        customer_email: customerEmail || null, // Store email for fallback lookup
                        status: subscription.status,
                        plan_type: planType,
                        people: people,
                        days: days,
                        delivery_day: deliveryDay,
                        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end || false,
                        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                        meal_plan_config: mealPlanConfig,
                        diets: mealPlanConfig.selected_diets || [],
                        allergies: mealPlanConfig.selected_allergies || [],
                        selected_meals: mealPlanConfig.selected_meals || [],
                        delivery_frequency: 'weekly',
                        updated_at: new Date().toISOString(),
                    };
                    if (!userId) return [3 /*break*/, 5];
                    subscriptionData.user_id = userId;
                    logWebhook('success', 'Using user_id from metadata', { hasUserId: true });
                    return [3 /*break*/, 12];
                case 5:
                    if (!customerEmail) return [3 /*break*/, 11];
                    return [4 /*yield*/, supabase.auth.admin.listUsers()];
                case 6:
                    _a = _o.sent(), users = _a.data, usersError = _a.error;
                    if (!usersError) return [3 /*break*/, 7];
                    logWebhook('error', 'Failed to list users', { error: usersError.message });
                    return [3 /*break*/, 10];
                case 7:
                    user = (_k = users === null || users === void 0 ? void 0 : users.users) === null || _k === void 0 ? void 0 : _k.find(function (u) { return u.email === customerEmail; });
                    if (!user) return [3 /*break*/, 8];
                    subscriptionData.user_id = user.id;
                    logWebhook('success', 'Found user by email in auth', { email: customerEmail, hasUserId: true });
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, supabase
                        .from('profiles')
                        .select('id')
                        .eq('email', customerEmail)
                        .single()];
                case 9:
                    profile = (_o.sent()).data;
                    if (profile) {
                        subscriptionData.user_id = profile.id;
                        logWebhook('success', 'Found user by email in profiles', { email: customerEmail, hasUserId: true });
                    }
                    else {
                        // Store subscription without user_id but WITH customer_email
                        // This allows the subscription to be linked later when user signs up
                        // or queried by email as fallback
                        logWebhook('warn', 'No user found for email, storing subscription with customer_email only', {
                            email: customerEmail,
                            stripe_subscription_id: subscriptionId
                        });
                    }
                    _o.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    logWebhook('warn', 'No user_id or email available for subscription', { customerId: customerId });
                    _o.label = 12;
                case 12:
                    // Upsert subscription
                    logWebhook('info', 'Attempting to upsert subscription', {
                        hasUserId: !!subscriptionData.user_id,
                        customer_email: subscriptionData.customer_email,
                        stripe_subscription_id: subscriptionData.stripe_subscription_id,
                        status: subscriptionData.status,
                        people: subscriptionData.people,
                        days: subscriptionData.days
                    });
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .upsert(subscriptionData, {
                            onConflict: 'stripe_subscription_id',
                            ignoreDuplicates: false,
                        })
                            .select()
                            .single()];
                case 13:
                    _b = _o.sent(), subError = _b.error, subData = _b.data;
                    if (subError) {
                        logWebhook('error', 'Failed to upsert subscription', {
                            error: subError,
                            errorMessage: subError.message,
                            errorCode: subError.code,
                            errorDetails: subError.details,
                            hint: subError.hint,
                            subscriptionData: {
                                user_id: subscriptionData.user_id,
                                customer_email: subscriptionData.customer_email,
                                stripe_subscription_id: subscriptionData.stripe_subscription_id,
                                status: subscriptionData.status
                            }
                        });
                        throw new Error("Database error: ".concat(subError.message));
                    }
                    logWebhook('success', 'Subscription upserted to database', {
                        id: subData.id,
                        hasUserId: !!subData.user_id,
                        customer_email: subData.customer_email,
                        stripe_subscription_id: subData.stripe_subscription_id,
                        status: subData.status
                    });
                    if (!subscriptionData.user_id) return [3 /*break*/, 15];
                    return [4 /*yield*/, createOrderFromCheckout(session, subscription, subscriptionData.user_id, supabase)];
                case 14:
                    _o.sent();
                    _o.label = 15;
                case 15:
                    if (!(customerEmail && subscriptionData.user_id)) return [3 /*break*/, 17];
                    return [4 /*yield*/, sendSubscriptionWelcomeEmail(customerEmail, subscriptionData.user_id, {
                            planDetails: "".concat(people, " ").concat(people === 1 ? 'osoba' : people < 5 ? 'osoby' : 'osób', ", ").concat(days, " ").concat(days === 1 ? 'dzień' : 'dni', " w tygodniu"),
                            deliveryDay: deliveryDay === 'tuesday' ? 'Wtorek' : 'Czwartek',
                            weeklyPrice: ((_m = (_l = subscription.items.data[0]) === null || _l === void 0 ? void 0 : _l.price) === null || _m === void 0 ? void 0 : _m.unit_amount)
                                ? "".concat((subscription.items.data[0].price.unit_amount / 100).toFixed(2), " PLN")
                                : 'N/A',
                            trialDays: subscription.trial_end ? 7 : undefined,
                        }, supabase)];
                case 16:
                    _o.sent();
                    _o.label = 17;
                case 17: return [2 /*return*/];
            }
        });
    });
}
/**
 * Helper: Calculate next delivery date based on delivery day preference
 */
function calculateDeliveryDate(deliveryDay) {
    var today = new Date();
    // Tuesday = 2, Thursday = 4
    var targetDay = deliveryDay.toLowerCase() === 'tuesday' ? 2 : 4;
    var currentDay = today.getDay();
    // Calculate days until next delivery day
    var daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) {
        daysUntil += 7; // Move to next week if day has passed
    }
    var deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + daysUntil);
    return deliveryDate;
}
/**
 * Helper: Create order from checkout session
 */
function createOrderFromCheckout(session, subscription, userId, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var totalAmount, people, days, deliveryDay, deliveryDate, _a, orderError, orderData, err_2;
        var _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 2, , 3]);
                    logWebhook('info', 'Creating order from checkout', { sessionId: session.id });
                    totalAmount = session.amount_total ? session.amount_total / 100 : 0;
                    people = Number.parseInt(((_b = session.metadata) === null || _b === void 0 ? void 0 : _b.number_of_people) || '2');
                    days = Number.parseInt(((_c = session.metadata) === null || _c === void 0 ? void 0 : _c.number_of_days) || '3');
                    deliveryDay = ((_d = session.metadata) === null || _d === void 0 ? void 0 : _d.delivery_day) || 'tuesday';
                    deliveryDate = calculateDeliveryDate(deliveryDay);
                    return [4 /*yield*/, supabase
                            .from('orders')
                            .insert({
                            user_id: userId,
                            subtotal: totalAmount,
                            total_amount: totalAmount,
                            currency: 'PLN',
                            status: 'confirmed',
                            payment_status: 'succeeded',
                            delivery_date: deliveryDate.toISOString().split('T')[0],
                            order_items: JSON.stringify([{
                                    type: 'subscription',
                                    plan: ((_e = session.metadata) === null || _e === void 0 ? void 0 : _e.plan_type) || 'weekly',
                                    people: people,
                                    days: days,
                                    meals: ((_f = session.metadata) === null || _f === void 0 ? void 0 : _f.selected_meals) ? JSON.parse(session.metadata.selected_meals) : [],
                                }]),
                            stripe_payment_intent_id: session.payment_intent,
                            confirmed_at: new Date().toISOString(),
                        })
                            .select()
                            .single()];
                case 1:
                    _a = _g.sent(), orderError = _a.error, orderData = _a.data;
                    if (orderError) {
                        logWebhook('error', 'Failed to create order', { error: orderError });
                    }
                    else {
                        logWebhook('success', 'Order created', { orderNumber: orderData.order_number });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _g.sent();
                    logWebhook('error', 'Error creating order', { error: err_2.message });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Helper: Send subscription welcome email
 */
function sendSubscriptionWelcomeEmail(email, userId, details, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var user, name_1, deliveryDayEn, firstDeliveryDate, emailSent, err_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    logWebhook('info', 'Preparing to send welcome email', { email: email, userId: userId });
                    return [4 /*yield*/, supabase.auth.admin.getUserById(userId)];
                case 1:
                    user = (_b.sent()).data;
                    if (!user) {
                        logWebhook('warn', 'User not found for welcome email', { userId: userId });
                        return [2 /*return*/];
                    }
                    name_1 = ((_a = user.user_metadata) === null || _a === void 0 ? void 0 : _a.full_name) || email.split('@')[0];
                    deliveryDayEn = details.deliveryDay.toLowerCase() === 'wtorek' ? 'tuesday' : 'thursday';
                    firstDeliveryDate = calculateDeliveryDate(deliveryDayEn);
                    logWebhook('info', 'Sending welcome email', {
                        to: email,
                        name: name_1,
                        deliveryDay: details.deliveryDay,
                        planDetails: details.planDetails
                    });
                    return [4 /*yield*/, (0, email_1.sendEmail)(__assign({ to: email }, email_1.emailTemplates.subscriptionCreated({
                            name: name_1,
                            planDetails: details.planDetails,
                            deliveryDay: details.deliveryDay,
                            firstDeliveryDate: firstDeliveryDate.toLocaleDateString('pl-PL', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }),
                            weeklyPrice: details.weeklyPrice,
                            trialDays: details.trialDays,
                            manageUrl: "".concat(process.env.NEXT_PUBLIC_SITE_URL, "/panel")
                        })))];
                case 2:
                    emailSent = _b.sent();
                    if (emailSent) {
                        logWebhook('success', 'Welcome email sent successfully', { email: email });
                    }
                    else {
                        logWebhook('warn', 'Failed to send welcome email - sendEmail returned false', { email: email });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _b.sent();
                    logWebhook('error', 'Error sending welcome email', {
                        error: err_3.message,
                        stack: err_3.stack,
                        email: email
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle customer.subscription.created event
 */
function handleSubscriptionCreated(subscription, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var customerId, userId, customer, email_2, users, user, error;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    logWebhook('info', 'Processing customer.subscription.created', { subscriptionId: subscription.id });
                    customerId = subscription.customer;
                    userId = (_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.user_id;
                    if (!!userId) return [3 /*break*/, 5];
                    logWebhook('warn', 'No user_id in subscription metadata, attempting email lookup');
                    return [4 /*yield*/, stripe.customers.retrieve(customerId)];
                case 1:
                    customer = _d.sent();
                    email_2 = customer.email;
                    if (!email_2) return [3 /*break*/, 4];
                    return [4 /*yield*/, supabase.auth.admin.listUsers()];
                case 2:
                    users = (_d.sent()).data;
                    user = (_b = users === null || users === void 0 ? void 0 : users.users) === null || _b === void 0 ? void 0 : _b.find(function (u) { return u.email === email_2; });
                    if (!user) return [3 /*break*/, 4];
                    // Update subscription metadata with user_id
                    return [4 /*yield*/, stripe.subscriptions.update(subscription.id, {
                            metadata: __assign(__assign({}, subscription.metadata), { user_id: user.id })
                        })];
                case 3:
                    // Update subscription metadata with user_id
                    _d.sent();
                    logWebhook('success', 'Added user_id to subscription metadata', { userId: user.id });
                    _d.label = 4;
                case 4: return [2 /*return*/];
                case 5: return [4 /*yield*/, supabase
                        .from('subscriptions')
                        .upsert({
                        user_id: userId,
                        stripe_subscription_id: subscription.id,
                        stripe_customer_id: customerId,
                        status: subscription.status,
                        plan_type: ((_c = subscription.metadata) === null || _c === void 0 ? void 0 : _c.plan_type) || 'weekly',
                        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end || false,
                        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
                        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                        updated_at: new Date().toISOString(),
                    }, {
                        onConflict: 'stripe_subscription_id',
                        ignoreDuplicates: false,
                    })];
                case 6:
                    error = (_d.sent()).error;
                    if (error) {
                        logWebhook('error', 'Failed to upsert subscription', { error: error });
                        throw new Error("Database error: ".concat(error.message));
                    }
                    logWebhook('success', 'Subscription created/updated in database');
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle customer.subscription.updated event
 */
function handleSubscriptionUpdated(subscription, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, currentSub, error, customer, email, emailErr_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logWebhook('info', 'Processing customer.subscription.updated', { subscriptionId: subscription.id });
                    userId = (_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.user_id;
                    if (!userId) {
                        logWebhook('warn', 'No user_id in subscription metadata');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .select('status, cancel_at_period_end')
                            .eq('stripe_subscription_id', subscription.id)
                            .single()];
                case 1:
                    currentSub = (_b.sent()).data;
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .update({
                            status: subscription.status,
                            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                            cancel_at_period_end: subscription.cancel_at_period_end || false,
                            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
                            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                            updated_at: new Date().toISOString(),
                        })
                            .eq('stripe_subscription_id', subscription.id)];
                case 2:
                    error = (_b.sent()).error;
                    if (error) {
                        logWebhook('error', 'Failed to update subscription', { error: error });
                        throw new Error("Database error: ".concat(error.message));
                    }
                    logWebhook('success', 'Subscription updated in database');
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 7, , 8]);
                    return [4 /*yield*/, stripe.customers.retrieve(subscription.customer)];
                case 4:
                    customer = _b.sent();
                    email = customer.email;
                    if (!(currentSub && email)) return [3 /*break*/, 6];
                    if (!(subscription.cancel_at_period_end && !currentSub.cancel_at_period_end)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, email_1.sendEmail)({
                            to: email,
                            subject: 'Subskrypcja anulowana - Smakowało',
                            html: "<p>Twoja subskrypcja zostanie zako\u0144czona ".concat(new Date(subscription.current_period_end * 1000).toLocaleDateString('pl-PL'), ".</p>")
                        })];
                case 5:
                    _b.sent();
                    logWebhook('success', 'Cancellation email sent', { email: email });
                    _b.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    emailErr_1 = _b.sent();
                    logWebhook('warn', 'Failed to send notification email', { error: emailErr_1.message });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle customer.subscription.deleted event
 * Marks subscription as canceled when it's completely deleted from Stripe
 */
function handleSubscriptionDeleted(subscription, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logWebhook('info', 'Processing customer.subscription.deleted', { subscriptionId: subscription.id });
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .update({
                            status: 'canceled',
                            canceled_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                            .eq('stripe_subscription_id', subscription.id)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        logWebhook('error', 'Failed to mark subscription as deleted', { error: error });
                        throw new Error("Database error: ".concat(error.message));
                    }
                    logWebhook('success', 'Subscription marked as canceled in database');
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle invoice.payment_succeeded event
 */
function handleInvoicePaymentSucceeded(invoice, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptionId, error, subData, planDetails, subscription, emailErr_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logWebhook('info', 'Processing invoice.payment_succeeded', { invoiceId: invoice.id });
                    subscriptionId = invoice.subscription;
                    if (!subscriptionId) {
                        logWebhook('info', 'Invoice not related to subscription, skipping');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .update({
                            last_payment_status: 'succeeded',
                            last_payment_date: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                            .eq('stripe_subscription_id', subscriptionId)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        logWebhook('error', 'Failed to update payment status', { error: error });
                    }
                    else {
                        logWebhook('success', 'Payment status updated');
                    }
                    if (!invoice.customer_email) return [3 /*break*/, 7];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .select('people, days')
                            .eq('stripe_subscription_id', subscriptionId)
                            .single()];
                case 3:
                    subData = (_a.sent()).data;
                    planDetails = subData
                        ? "".concat(subData.people, " ").concat(subData.people === 1 ? 'osoba' : subData.people < 5 ? 'osoby' : 'osób', ", ").concat(subData.days, " ").concat(subData.days === 1 ? 'dzień' : 'dni', " w tygodniu")
                        : 'Subskrypcja Smakowało';
                    return [4 /*yield*/, stripe.subscriptions.retrieve(subscriptionId)];
                case 4:
                    subscription = _a.sent();
                    return [4 /*yield*/, (0, email_1.sendEmail)(__assign({ to: invoice.customer_email }, email_1.emailTemplates.paymentSucceeded({
                            name: invoice.customer_name || invoice.customer_email.split('@')[0],
                            amount: "".concat((invoice.amount_paid / 100).toFixed(2), " PLN"),
                            invoiceUrl: invoice.hosted_invoice_url || "".concat(process.env.NEXT_PUBLIC_SITE_URL, "/panel"),
                            nextPaymentDate: new Date(subscription.current_period_end * 1000).toLocaleDateString('pl-PL', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }),
                            planDetails: planDetails
                        })))];
                case 5:
                    _a.sent();
                    logWebhook('success', 'Payment confirmation email sent', { email: invoice.customer_email });
                    return [3 /*break*/, 7];
                case 6:
                    emailErr_2 = _a.sent();
                    logWebhook('warn', 'Failed to send payment confirmation email', { error: emailErr_2.message });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle invoice.payment_failed event
 */
function handleInvoicePaymentFailed(invoice, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptionId, error, subData, planDetails, subscription, portalSession, retryDate, emailErr_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logWebhook('info', 'Processing invoice.payment_failed', { invoiceId: invoice.id });
                    subscriptionId = invoice.subscription;
                    if (!subscriptionId) {
                        logWebhook('info', 'Invoice not related to subscription, skipping');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .update({
                            last_payment_status: 'failed',
                            last_payment_date: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                            .eq('stripe_subscription_id', subscriptionId)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        logWebhook('error', 'Failed to update payment status', { error: error });
                    }
                    else {
                        logWebhook('success', 'Payment failure status updated');
                    }
                    if (!invoice.customer_email) return [3 /*break*/, 8];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, supabase
                            .from('subscriptions')
                            .select('people, days, stripe_customer_id')
                            .eq('stripe_subscription_id', subscriptionId)
                            .single()];
                case 3:
                    subData = (_a.sent()).data;
                    planDetails = subData
                        ? "".concat(subData.people, " ").concat(subData.people === 1 ? 'osoba' : subData.people < 5 ? 'osoby' : 'osób', ", ").concat(subData.days, " ").concat(subData.days === 1 ? 'dzień' : 'dni', " w tygodniu")
                        : 'Subskrypcja Smakowało';
                    return [4 /*yield*/, stripe.subscriptions.retrieve(subscriptionId)];
                case 4:
                    subscription = _a.sent();
                    return [4 /*yield*/, stripe.billingPortal.sessions.create({
                            customer: (subData === null || subData === void 0 ? void 0 : subData.stripe_customer_id) || subscription.customer,
                            return_url: "".concat(process.env.NEXT_PUBLIC_SITE_URL, "/panel"),
                        })];
                case 5:
                    portalSession = _a.sent();
                    retryDate = new Date();
                    retryDate.setDate(retryDate.getDate() + 3);
                    return [4 /*yield*/, (0, email_1.sendEmail)(__assign({ to: invoice.customer_email }, email_1.emailTemplates.paymentFailed({
                            name: invoice.customer_name || invoice.customer_email.split('@')[0],
                            amount: "".concat((invoice.amount_due / 100).toFixed(2), " PLN"),
                            retryDate: retryDate.toLocaleDateString('pl-PL', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }),
                            updatePaymentUrl: portalSession.url,
                            planDetails: planDetails
                        })))];
                case 6:
                    _a.sent();
                    logWebhook('success', 'Payment failure email sent', { email: invoice.customer_email });
                    return [3 /*break*/, 8];
                case 7:
                    emailErr_3 = _a.sent();
                    logWebhook('warn', 'Failed to send payment failure email', { error: emailErr_3.message });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle customer.subscription.trial_will_end event
 */
function handleTrialWillEnd(subscription, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var customer, email, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logWebhook('info', 'Processing trial_will_end', { subscriptionId: subscription.id });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, stripe.customers.retrieve(subscription.customer)];
                case 2:
                    customer = _a.sent();
                    email = customer.email;
                    if (!(email && subscription.trial_end)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, email_1.sendEmail)({
                            to: email,
                            subject: 'Twój okres próbny kończy się wkrótce - Smakowało',
                            html: "\n          <h2>Tw\u00F3j okres pr\u00F3bny ko\u0144czy si\u0119 wkr\u00F3tce</h2>\n          <p>Tw\u00F3j bezp\u0142atny okres pr\u00F3bny zako\u0144czy si\u0119: <strong>".concat(new Date(subscription.trial_end * 1000).toLocaleDateString('pl-PL', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            }), "</strong></p>\n          <p>Po zako\u0144czeniu okresu pr\u00F3bnego Twoja subskrypcja b\u0119dzie kontynuowana, a pierwsza p\u0142atno\u015B\u0107 zostanie pobrana automatycznie.</p>\n          <p>Je\u015Bli chcesz anulowa\u0107 subskrypcj\u0119 przed zako\u0144czeniem okresu pr\u00F3bnego, mo\u017Cesz to zrobi\u0107 w <a href=\"").concat(process.env.NEXT_PUBLIC_SITE_URL, "/panel\">panelu u\u017Cytkownika</a>.</p>\n          <p>Zesp\u00F3\u0142 Smakowa\u0142o</p>\n        ")
                        })];
                case 3:
                    _a.sent();
                    logWebhook('success', 'Trial ending notification sent', { email: email });
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_4 = _a.sent();
                    logWebhook('warn', 'Failed to send trial ending notification', { error: err_4.message });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
