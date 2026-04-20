/**
 * NEWS API Test Script
 * 
 * Tests all news and categories endpoints with proper RBAC validation.
 * Run: node test-news-api.js
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(message, color = 'white') {
    console.log(colors[color] + message + colors.reset);
}

function logTest(testName) {
    console.log('\n' + '='.repeat(50));
    log(`🧪 Testing: ${testName}`, 'cyan');
    console.log('='.repeat(50));
}

function logResult(success, message, data = null) {
    const symbol = success ? '✅' : '❌';
    const color = success ? 'green' : 'red';
    log(`${symbol} ${message}`, color);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = await response.text();
        }

        return {
            status: response.status,
            ok: response.ok,
            data
        };
    } catch (error) {
        log(`❌ Request failed: ${error.message}`, 'red');
        return {
            status: 0,
            ok: false,
            error: error.message
        };
    }
}

// Test Authentication
async function testAuthentication() {
    logTest('Authentication');
    
    const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            username: 'superadmin',
            password: '123456'
        })
    });

    if (response.ok && response.data.token) {
        authToken = response.data.token;
        logResult(true, 'Login successful');
        return true;
    } else {
        logResult(false, 'Login failed', response.data);
        return false;
    }
}

// Test Categories API
async function testCategoriesAPI() {
    logTest('Categories API Tests');
    
    // Test create category
    log('\n📝 Testing create category...', 'yellow');
    const createCategoryResponse = await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify({
            name: 'Du học Nhật Bản',
            slug: 'du-hoc-nhat-ban'
        })
    });
    
    let categoryId = null;
    if (createCategoryResponse.ok) {
        categoryId = createCategoryResponse.data.data.id;
        logResult(true, 'Category created successfully', {
            id: categoryId,
            name: createCategoryResponse.data.data.name
        });
    } else {
        logResult(false, 'Failed to create category', createCategoryResponse.data);
    }

    // Test get categories
    log('\n📋 Testing get categories...', 'yellow');
    const getCategoriesResponse = await apiRequest('/categories');
    
    if (getCategoriesResponse.ok) {
        logResult(true, `Retrieved ${getCategoriesResponse.data.data.length} categories`);
    } else {
        logResult(false, 'Failed to get categories', getCategoriesResponse.data);
    }

    // Test get category by ID
    if (categoryId) {
        log('\n🔍 Testing get category by ID...', 'yellow');
        const getCategoryResponse = await apiRequest(`/categories/${categoryId}`);
        
        if (getCategoryResponse.ok) {
            logResult(true, 'Category retrieved by ID', {
                id: getCategoryResponse.data.data.id,
                name: getCategoryResponse.data.data.name,
                news_count: getCategoryResponse.data.data.news_count
            });
        } else {
            logResult(false, 'Failed to get category by ID', getCategoryResponse.data);
        }
    }

    // Test update category
    if (categoryId) {
        log('\n✏️ Testing update category...', 'yellow');
        const updateCategoryResponse = await apiRequest(`/categories/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: 'Du học Nhật Bản - Updated',
                slug: 'du-hoc-nhat-ban-updated'
            })
        });
        
        if (updateCategoryResponse.ok) {
            logResult(true, 'Category updated successfully', {
                id: updateCategoryResponse.data.data.id,
                name: updateCategoryResponse.data.data.name
            });
        } else {
            logResult(false, 'Failed to update category', updateCategoryResponse.data);
        }
    }

    return categoryId;
}

// Test News API
async function testNewsAPI(categoryId) {
    logTest('News API Tests');
    
    // Test create news
    log('\n📝 Testing create news...', 'yellow');
    const createNewsResponse = await apiRequest('/news', {
        method: 'POST',
        body: JSON.stringify({
            title: 'Hướng dẫn du học Nhật Bản 2024',
            content: 'Nội dung chi tiết về du học Nhật Bản. Đây là một bài viết test với nội dung đầy đủ về các bước cần thiết để du học tại Nhật Bản...',
            excerpt: 'Hướng dẫn chi tiết các bước du học Nhật Bản',
            category_id: categoryId,
            status: 'draft',
            meta_title: 'Du học Nhật Bản 2024 - Hướng dẫn chi tiết',
            meta_description: 'Hướng dẫn đầy đủ về du học Nhật Bản, từ chuẩn bị hồ sơ đến cuộc sống tại Nhật'
        })
    });
    
    let newsId = null;
    if (createNewsResponse.ok) {
        newsId = createNewsResponse.data.data.id;
        logResult(true, 'News created successfully', {
            id: newsId,
            title: createNewsResponse.data.data.title,
            status: createNewsResponse.data.data.status
        });
    } else {
        logResult(false, 'Failed to create news', createNewsResponse.data);
    }

    // Test get news
    log('\n📋 Testing get news...', 'yellow');
    const getNewsResponse = await apiRequest('/news');
    
    if (getNewsResponse.ok) {
        logResult(true, `Retrieved ${getNewsResponse.data.data.length} news articles`);
    } else {
        logResult(false, 'Failed to get news', getNewsResponse.data);
    }

    // Test get news with filters
    log('\n🔍 Testing get news with filters...', 'yellow');
    const getNewsFilteredResponse = await apiRequest('/news?status=draft');
    
    if (getNewsFilteredResponse.ok) {
        logResult(true, `Retrieved ${getNewsFilteredResponse.data.data.length} draft news`);
    } else {
        logResult(false, 'Failed to get filtered news', getNewsFilteredResponse.data);
    }

    // Test get news by ID
    if (newsId) {
        log('\n🔍 Testing get news by ID...', 'yellow');
        const getNewsResponse = await apiRequest(`/news/${newsId}`);
        
        if (getNewsResponse.ok) {
            logResult(true, 'News retrieved by ID', {
                id: getNewsResponse.data.data.id,
                title: getNewsResponse.data.data.title,
                author: getNewsResponse.data.data.author_name
            });
        } else {
            logResult(false, 'Failed to get news by ID', getNewsResponse.data);
        }
    }

    // Test update news
    if (newsId) {
        log('\n✏️ Testing update news...', 'yellow');
        const updateNewsResponse = await apiRequest(`/news/${newsId}`, {
            method: 'PUT',
            body: JSON.stringify({
                title: 'Hướng dẫn du học Nhật Bản 2024 - Updated',
                status: 'published'
            })
        });
        
        if (updateNewsResponse.ok) {
            logResult(true, 'News updated successfully', {
                id: updateNewsResponse.data.data.id,
                title: updateNewsResponse.data.data.title,
                status: updateNewsResponse.data.data.status
            });
        } else {
            logResult(false, 'Failed to update news', updateNewsResponse.data);
        }
    }

    // Test news statistics
    log('\n📊 Testing news statistics...', 'yellow');
    const getStatsResponse = await apiRequest('/news/stats');
    
    if (getStatsResponse.ok) {
        logResult(true, 'News statistics retrieved', getStatsResponse.data.data);
    } else {
        logResult(false, 'Failed to get news statistics', getStatsResponse.data);
    }

    // Test track news view
    if (newsId) {
        log('\n👀 Testing track news view...', 'yellow');
        const trackViewResponse = await apiRequest(`/news/${newsId}/view`, {
            method: 'POST'
        });
        
        if (trackViewResponse.ok) {
            logResult(true, 'News view tracked successfully');
        } else {
            logResult(false, 'Failed to track news view', trackViewResponse.data);
        }
    }

    return newsId;
}

// Test RBAC (Role-Based Access Control)
async function testRBAC() {
    logTest('RBAC Testing');
    
    // Test with different roles
    const roles = [
        { username: 'admin', role: 'Admin' },
        { username: 'consultant', role: 'Consultant' }
    ];
    
    for (const roleTest of roles) {
        log(`\n🔐 Testing ${roleTest.role} permissions...`, 'yellow');
        
        // Login with different role
        const loginResponse = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username: roleTest.username,
                password: '123456'
            })
        });
        
        if (loginResponse.ok) {
            const roleToken = loginResponse.data.token;
            
            // Test news access
            const newsResponse = await apiRequest('/news', {
                headers: { Authorization: `Bearer ${roleToken}` }
            });
            
            if (roleTest.username === 'consultant') {
                // Consultant should NOT have access to news
                if (!newsResponse.ok && newsResponse.status === 403) {
                    logResult(true, `${roleTest.role} correctly denied news access`);
                } else {
                    logResult(false, `${roleTest.role} should not have news access`);
                }
            } else {
                // Admin should have access
                if (newsResponse.ok) {
                    logResult(true, `${roleTest.role} has correct news access`);
                } else {
                    logResult(false, `${roleTest.role} should have news access`);
                }
            }
        }
    }
    
    // Restore superadmin token
    const restoreLogin = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            username: 'superadmin',
            password: '123456'
        })
    });
    
    if (restoreLogin.ok) {
        authToken = restoreLogin.data.token;
    }
}

// Test error handling
async function testErrorHandling() {
    logTest('Error Handling Tests');
    
    // Test invalid news ID
    log('\n🚫 Testing invalid news ID...', 'yellow');
    const invalidNewsResponse = await apiRequest('/news/999999');
    
    if (!invalidNewsResponse.ok && invalidNewsResponse.status === 404) {
        logResult(true, 'Invalid news ID handled correctly');
    } else {
        logResult(false, 'Invalid news ID not handled properly');
    }
    
    // Test invalid category ID
    log('\n🚫 Testing invalid category ID...', 'yellow');
    const invalidCategoryResponse = await apiRequest('/categories/999999');
    
    if (!invalidCategoryResponse.ok && invalidCategoryResponse.status === 404) {
        logResult(true, 'Invalid category ID handled correctly');
    } else {
        logResult(false, 'Invalid category ID not handled properly');
    }
    
    // Test invalid data
    log('\n🚫 Testing create news without required fields...', 'yellow');
    const invalidNewsCreateResponse = await apiRequest('/news', {
        method: 'POST',
        body: JSON.stringify({
            // Missing title and content
            status: 'draft'
        })
    });
    
    if (!invalidNewsCreateResponse.ok && invalidNewsCreateResponse.status === 400) {
        logResult(true, 'Missing required fields handled correctly');
    } else {
        logResult(false, 'Missing required fields not handled properly');
    }
}

// Cleanup test data
async function cleanupTestData(categoryId, newsId) {
    logTest('Cleanup Test Data');
    
    // Delete test news
    if (newsId) {
        log('\n🗑️ Deleting test news...', 'yellow');
        const deleteNewsResponse = await apiRequest(`/news/${newsId}`, {
            method: 'DELETE'
        });
        
        if (deleteNewsResponse.ok) {
            logResult(true, 'Test news deleted successfully');
        } else {
            logResult(false, 'Failed to delete test news', deleteNewsResponse.data);
        }
    }
    
    // Delete test category
    if (categoryId) {
        log('\n🗑️ Deleting test category...', 'yellow');
        const deleteCategoryResponse = await apiRequest(`/categories/${categoryId}`, {
            method: 'DELETE'
        });
        
        if (deleteCategoryResponse.ok) {
            logResult(true, 'Test category deleted successfully');
        } else {
            logResult(false, 'Failed to delete test category', deleteCategoryResponse.data);
        }
    }
}

// Main test execution
async function runTests() {
    console.clear();
    log('🚀 Starting News API Tests', 'magenta');
    log(`📍 Base URL: ${BASE_URL}`, 'blue');
    
    try {
        // Authentication
        const authSuccess = await testAuthentication();
        if (!authSuccess) {
            log('❌ Authentication failed, stopping tests', 'red');
            return;
        }
        
        // Categories API
        const categoryId = await testCategoriesAPI();
        
        // News API
        const newsId = await testNewsAPI(categoryId);
        
        // RBAC Testing
        await testRBAC();
        
        // Error Handling
        await testErrorHandling();
        
        // Cleanup
        await cleanupTestData(categoryId, newsId);
        
        // Summary
        logTest('Test Summary');
        log('🎉 All news API tests completed!', 'green');
        log('📝 Review the results above for any failures', 'blue');
        
    } catch (error) {
        log(`💥 Test execution failed: ${error.message}`, 'red');
        console.error(error);
    }
}

// Run the tests
runTests();