'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/LanguageContext';
import styles from './financials.module.css';
import { Button } from '@/components/ui/Button';
import { calculateTotalProgress } from '@/lib/onboarding-utils';

interface PropertyFinancials {
    id: string;
    name: string;
    address: string;
    owner_name: string;
    data: any;
    fixed_daily: number;
    variable_daily: number;
    min_price_20: number;
}

export default function FinancialsPage() {
    const { t } = useLanguage();
    const [properties, setProperties] = useState<PropertyFinancials[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<PropertyFinancials | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<any>(null);
    const [mgmtFee, setMgmtFee] = useState(20);
    const supabase = createClient();

    const fetchData = async () => {
        try {
            const { data, error } = await supabase
                .from('properties')
                .select(`
                    id,
                    name,
                    data,
                    owner_id,
                    owner:profiles!properties_owner_id_fkey(full_name)
                `);

            if (error) {
                // If the join fails, try without it
                console.warn('Join failed, trying without owner:', error);
                const { data: simpleData, error: simpleError } = await supabase
                    .from('properties')
                    .select('id, name, data, owner_id');
                
                if (simpleError) throw simpleError;
                
                const mapped = simpleData.map((p: any) => mapProperty(p, null));
                setProperties(mapped);
            } else {
                const mapped = data.map((p: any) => mapProperty(p, p.owner?.full_name));
                setProperties(mapped);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateDailyPrice = (data: any, feePercent: number) => {
        const fin = data?.financials || {};
        const fCosts = fin.fixedCosts || {};
        const vCosts = fin.variableCosts || {};

        // Sum all fixed costs EXCEPT percentages
        const fixedTotal = Object.entries(fCosts).reduce((acc: number, [key, val]: [string, any]) => {
            if (key === 'adminFee' || key === 'miscPercent') return acc;
            return acc + (parseFloat(val) || 0);
        }, 0);

        const varTotal = Object.values(vCosts).reduce((acc: number, val: any) => acc + (parseFloat(val) || 0), 0);

        const dFixed = fixedTotal / 365;
        const dVar = varTotal / 365;
        
        // Round to 2 decimal places to match visual representation
        const dFixedRounded = Math.round(dFixed * 100) / 100;
        const dVarRounded = Math.round(dVar * 100) / 100;
        
        const subtotal = dFixedRounded + dVarRounded;
        const price = subtotal * (1 + feePercent / 100);
        
        return {
            dFixed: dFixedRounded,
            dVar: dVarRounded,
            price: Math.round(price * 100) / 100,
            rawFixed: fixedTotal,
            rawVar: varTotal
        };
    };

    const mapProperty = (p: any, ownerName: string | null) => {
        const { dFixed, dVar, price } = calculateDailyPrice(p.data, 20);

        return {
            id: p.id,
            name: p.data?.info?.propertyName || p.name || `Property #${p.id.substr(0, 4)}`,
            address: p.data?.info?.address || '',
            owner_name: ownerName || 'Unknown Owner',
            data: p.data,
            fixed_daily: dFixed,
            variable_daily: dVar,
            min_price_20: price,
        };
    };

    useEffect(() => {
        fetchData();
    }, [supabase]);

    const handleSelect = (prop: PropertyFinancials) => {
        setSelectedProperty(prop);
        setEditedData(JSON.parse(JSON.stringify(prop.data)));
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!selectedProperty) return;

        const newProgress = calculateTotalProgress(editedData);

        const { error } = await supabase
            .from('properties')
            .update({
                data: editedData,
                progress: newProgress
            })
            .eq('id', selectedProperty.id);

        if (error) {
            alert('Error updating property: ' + error.message);
            return;
        }

        setIsEditing(false);
        // Important: Fetch fresh data to update the sidebar list
        await fetchData();
    };

    if (loading) return <div className={styles.container}>Loading...</div>;

    const financialsForRows = isEditing ? editedData.financials : selectedProperty?.data?.financials;
    const fRows = financialsForRows?.fixedCosts || {};
    const vRows = financialsForRows?.variableCosts || {};

    const { dFixed, dVar, price, rawFixed, rawVar } = calculateDailyPrice(isEditing ? editedData : selectedProperty?.data, mgmtFee);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{t('financials.title')}</h1>
                    <p className={styles.subtitle}>Manage costs and calculate minimum prices.</p>
                </div>
            </header>

            <div className={styles.layout}>
                {/* List Pane */}
                <div className={styles.listPane}>
                    <div className={styles.tableCard}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    <th>Daily (20%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {properties.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                            No properties found
                                        </td>
                                    </tr>
                                ) : (
                                    properties.map(p => (
                                        <tr 
                                            key={p.id} 
                                            onClick={() => handleSelect(p)}
                                            className={selectedProperty?.id === p.id ? styles.selectedRow : ''}
                                        >
                                            <td className={styles.propName}>
                                                {p.name}
                                                <div className={styles.propAddress}>{p.address}</div>
                                                <div className={styles.ownerSub}>👤 {p.owner_name}</div>
                                            </td>
                                            <td className={styles.priceCell}>${p.min_price_20.toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail Pane */}
                <div className={styles.detailPane}>
                    {selectedProperty ? (
                        <div className={styles.detailCard}>
                            <div className={styles.cardHeader}>
                                <h2>{selectedProperty.name}</h2>
                                <div className={styles.headerActions}>
                                    {isEditing ? (
                                        <>
                                            <Button size="sm" onClick={handleSave} style={{ backgroundColor: '#28a745', color: 'white' }}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        </>
                                    ) : (
                                        <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Edit Costs</Button>
                                    )}
                                </div>
                            </div>

                            <div className={styles.financialsGrid}>
                                <div>
                                    <h3 className={styles.sectionTitle}>📊 {t('financials.fixed.title')}</h3>
                                    <div className={styles.costList}>
                                        <CostRow 
                                            label={t('financials.fixed.municipal_taxes')} 
                                            value={fRows.municipalTaxes} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, municipalTaxes: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.school_taxes')} 
                                            value={fRows.schoolTaxes} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, schoolTaxes: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.water_taxes')} 
                                            value={fRows.waterTaxes} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, waterTaxes: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.insurance')} 
                                            value={fRows.insurance} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, insurance: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.advertising')} 
                                            value={fRows.advertising} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, advertising: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.citq')} 
                                            value={fRows.citqFee} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, citqFee: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.admin_fee')} 
                                            value={fRows.adminFee} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, adminFee: parseFloat(v) || 0}}})} 
                                            isPercentage={true}
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.cleaning_per_stay')} 
                                            value={fRows.cleaningPerStay} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, cleaningPerStay: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.snow_removal')} 
                                            value={fRows.snowRemoval} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, snowRemoval: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.lawn_landscaping')} 
                                            value={fRows.lawnLandscaping} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, lawnLandscaping: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.maintenance_monthly')} 
                                            value={fRows.maintenanceMonthly} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, maintenanceMonthly: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.exterminator')} 
                                            value={fRows.exterminator} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, exterminator: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.association_fee')} 
                                            value={fRows.associationFee} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, associationFee: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.accounting')} 
                                            value={fRows.accounting} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, accounting: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.fixed.misc_percent')} 
                                            value={fRows.miscPercent} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, fixedCosts: {...editedData.financials.fixedCosts, miscPercent: parseFloat(v) || 0}}})} 
                                            isPercentage={true}
                                        />
                                        
                                        <div className={styles.summaryRows}>
                                            <div className={styles.summaryRow}>
                                                <span>Total Fixed (Yearly)</span>
                                                <strong>${rawFixed.toFixed(2)}</strong>
                                            </div>
                                            <div className={styles.summaryRow}>
                                                <span>Daily Fixed</span>
                                                <strong>${dFixed.toFixed(2)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className={styles.sectionTitle}>📈 {t('financials.variable.title')}</h3>
                                    <div className={styles.costList}>
                                        <CostRow 
                                            label={t('financials.variable.appliance_rental')} 
                                            value={vRows.applianceRental} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, variableCosts: {...editedData.financials.variableCosts, applianceRental: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.variable.appliance_repair')} 
                                            value={vRows.applianceRepair} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, variableCosts: {...editedData.financials.variableCosts, applianceRepair: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.variable.waste_management')} 
                                            value={vRows.wasteManagement} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, variableCosts: {...editedData.financials.variableCosts, wasteManagement: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.variable.electricity')} 
                                            value={vRows.electricity} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, variableCosts: {...editedData.financials.variableCosts, electricity: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.variable.heating_oil_gas')} 
                                            value={vRows.heatingOilGas} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, variableCosts: {...editedData.financials.variableCosts, heatingOilGas: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.variable.wood')} 
                                            value={vRows.wood} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, variableCosts: {...editedData.financials.variableCosts, wood: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.variable.pool_spa')} 
                                            value={vRows.poolSpa} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, variableCosts: {...editedData.financials.variableCosts, poolSpa: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.variable.telecom')} 
                                            value={vRows.telecom} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, variableCosts: {...editedData.financials.variableCosts, telecom: parseFloat(v) || 0}}})} 
                                        />
                                        <CostRow 
                                            label={t('financials.variable.condo_fees')} 
                                            value={vRows.condoFees} 
                                            isEditing={isEditing} 
                                            onChange={(v) => setEditedData({...editedData, financials: {...editedData.financials, variableCosts: {...editedData.financials.variableCosts, condoFees: parseFloat(v) || 0}}})} 
                                        />
                                        
                                        <div className={styles.summaryRows}>
                                            <div className={styles.summaryRow}>
                                                <span>Total Variable (Yearly)</span>
                                                <strong>${rawVar.toFixed(2)}</strong>
                                            </div>
                                            <div className={styles.summaryRow}>
                                                <span>Daily Variable</span>
                                                <strong>${dVar.toFixed(2)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.calculatorCard}>
                                <h3 className={styles.calcTitle}>🧮 {t('financials.calculator.title')}</h3>
                                <div className={styles.calcGrid}>
                                    <div>
                                        <label className={styles.calcLabel}>{t('financials.calculator.management_fee')}</label>
                                        <div className={styles.feeToggles}>
                                            {[15, 20, 25].map(fee => (
                                                <button 
                                                    key={fee} 
                                                    onClick={() => setMgmtFee(fee)}
                                                    className={`${styles.feeBtn} ${mgmtFee === fee ? styles.feeBtnActive : ''}`}
                                                >
                                                    {fee}%
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.calcResults}>
                                        <div className={styles.priceResult}>
                                            <label>PRIX MINIMUM PAR NUIT</label>
                                            <div className={styles.priceValue}>${price.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.formula}>
                                    <strong>Formula:</strong> (Fixed Daily ${dFixed.toFixed(2)} + Variable Daily ${dVar.toFixed(2)}) * (1 + {mgmtFee}%) = ${price.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>💰</div>
                            <h3>Select a property</h3>
                            <p>Choose a property from the list to view and calculate its minimum nightly price.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CostRow({ label, value, isEditing, onChange, isPercentage }: { label: string, value: any, isEditing: boolean, onChange: (v: string) => void, isPercentage?: boolean }) {
    return (
        <div className={styles.costRow}>
            <span className={styles.costLabel}>{label}</span>
            {isEditing ? (
                <input 
                    type="number" 
                    className={styles.costInput} 
                    value={value ?? ''} 
                    onChange={(e) => onChange(e.target.value)}
                />
            ) : (
                <span className={styles.costValue}>{isPercentage ? `${(value || 0).toFixed(2)}%` : `$${(value || 0).toFixed(2)}`}</span>
            )}
        </div>
    );
}
