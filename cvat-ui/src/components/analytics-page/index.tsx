import React, { useEffect, useState } from 'react';
import { notification, Spin, Card, Statistic, Row, Col } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';

interface AnalyticsProps {
    jobId?: number;
}

export default function PerClassAnalyticsComponent({ jobId }: AnalyticsProps) {
    const [counts, setCounts] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Nginx reverse proxy ke mutabiq endpoint ko /api/v1/ prefix ke sath update kiya hai
        const endpoint = jobId
            ? `/api/v1/analytics/per-class/${jobId}/`
            : `/api/v1/analytics/per-class/`;

        fetch(endpoint, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
                'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || '',
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.error || 'Failed to fetch analytics data.');
                }
                return res.json();
            })
            .then((data) => {
                setCounts(data.per_class_counts || {});
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
                notification.error({
                    message: 'Analytics Error',
                    description: err.message,
                });
            });
    }, [jobId]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin tip='Loading per-class analytics...' />
            </div>
        );
    }

    if (error) {
        return (
            <Card style={{ margin: '20px', borderColor: '#ff4d4f' }}>
                <p style={{ color: '#ff4d4f', fontWeight: 'bold' }}>Failed to load analytics: {error}</p>
            </Card>
        );
    }

    const totalAnnotations = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <Card
            title={
                <span>
                    <BarChartOutlined /> Per-Class Annotation Analytics
                </span>
            }
            style={{ margin: '20px 0' }}
        >
            <Row gutter={16} style={{ marginBottom: '20px' }}>
                <Col span={12}>
                    <Statistic title='Total Annotations' value={totalAnnotations} />
                </Col>
                <Col span={12}>
                    <Statistic title='Unique Classes' value={Object.keys(counts).length} />
                </Col>
            </Row>

            {Object.keys(counts).length === 0 ? (
                <p>No annotation data found for this context.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Object.entries(counts).map(([className, count]) => {
                        const percentage = totalAnnotations > 0 ? (count / totalAnnotations) * 100 : 0;
                        return (
                            <div
                                key={className}
                                style={{ background: '#f5f5f5', padding: '10px 15px', borderRadius: '6px' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <strong>{className}</strong>
                                    <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{count}</span>
                                </div>
                                <div
                                    style={{
                                        width: '100%',
                                        background: '#e0e0e0',
                                        height: '8px',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${percentage}%`,
                                            background: '#1890ff',
                                            height: '100%',
                                            transition: 'width 0.3s ease',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}