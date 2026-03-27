import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Property } from '@/lib/types';
import styles from './Step.module.css';
import { useLanguage } from '@/lib/LanguageContext';

interface StepOwnerRequestsProps {
    data?: Property['data']['ownerRequests'];
    onUpdate: (data: Property['data']['ownerRequests']) => void;
    onNext: () => void;
    onBack: () => void;
}

type OwnerRequestSection = 'spa' | 'bedding' | 'consumables' | 'bbq' | 'emergencyKit' | 'expenseAuth';

export default function StepOwnerRequests({ data, onUpdate, onNext, onBack }: StepOwnerRequestsProps) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<any>(data || {});
    const [expanded, setExpanded] = useState<Record<string, boolean>>({
        spa: true,
        bedding: false,
        consumables: false,
        bbq: false,
        emergency: false,
        expense: false
    });

    const toggleSection = (section: string) => {
        setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleChange = (section: OwnerRequestSection, field: string, value: any) => {
        const updated = {
            ...formData,
            [section]: {
                ...(formData[section] || {}),
                [field]: value
            }
        };
        setFormData(updated);
    };

    const handleSave = () => {
        onUpdate(formData);
        // Optional: show a small toast or just let the user click "Next"
    };

    const YesNoToggle = ({ label, value, onChange }: { label: string, value?: boolean, onChange: (v: boolean) => void }) => (
        <div className={styles.toggleRow} style={{ cursor: 'default' }}>
            <span className={styles.toggleLabel}>{label}</span>
            <div className={styles.toggleGroup}>
                <button
                    type="button"
                    className={`${styles.toggleBtn} ${value === true ? styles.toggleBtnActive : ''}`}
                    onClick={() => onChange(true)}
                >
                    {t('owner_req.common.yes')}
                </button>
                <button
                    type="button"
                    className={`${styles.toggleBtn} ${value === false ? styles.toggleBtnActive : ''}`}
                    onClick={() => onChange(false)}
                >
                    {t('owner_req.common.no')}
                </button>
            </div>
        </div>
    );

    return (
        <div className={styles.container}>
            {/* 1. Spa */}
            <div className={`${styles.expandableSection} ${expanded.spa ? styles.expanded : ''}`}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('spa')}>
                    <h4>{t('owner_req.spa.title')}</h4>
                    <span className={styles.expandIcon}>▼</span>
                </div>
                {expanded.spa && (
                    <div className={styles.sectionContent}>
                        <Select
                            label={t('owner_req.spa.treatment')}
                            value={formData.spa?.treatmentType || ''}
                            onChange={e => handleChange('spa', 'treatmentType', e.target.value)}
                            options={[
                                { value: 'brome', label: t('owner_req.spa.brome') },
                                { value: 'chlore', label: t('owner_req.spa.chlore') },
                                { value: 'sel', label: t('owner_req.spa.sel') },
                            ]}
                        />
                        <div className={styles.grid}>
                            <Input
                                label={t('owner_req.spa.products')}
                                value={formData.spa?.productsUsed || ''}
                                onChange={e => handleChange('spa', 'productsUsed', e.target.value)}
                            />
                            <Input
                                label={t('owner_req.spa.location')}
                                value={formData.spa?.productsLocation || ''}
                                onChange={e => handleChange('spa', 'productsLocation', e.target.value)}
                            />
                        </div>
                        <YesNoToggle
                            label={t('owner_req.spa.contract')}
                            value={formData.spa?.hasMaintenanceContract}
                            onChange={v => handleChange('spa', 'hasMaintenanceContract', v)}
                        />
                    </div>
                )}
            </div>

            {/* 2. Bedding */}
            <div className={`${styles.expandableSection} ${expanded.bedding ? styles.expanded : ''}`}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('bedding')}>
                    <h4>{t('owner_req.bedding.title')}</h4>
                    <span className={styles.expandIcon}>▼</span>
                </div>
                {expanded.bedding && (
                    <div className={styles.sectionContent}>
                        <YesNoToggle
                            label={t('owner_req.bedding.protection')}
                            value={formData.bedding?.hasProtection}
                            onChange={v => handleChange('bedding', 'hasProtection', v)}
                        />
                        <div className={styles.grid}>
                            <Input
                                label={t('owner_req.bedding.pillows')}
                                type="number"
                                min={0}
                                value={formData.bedding?.pillowsCount ?? ''}
                                onChange={e => handleChange('bedding', 'pillowsCount', parseInt(e.target.value) || 0)}
                            />
                            <Input
                                label={t('owner_req.bedding.blankets')}
                                type="number"
                                min={0}
                                value={formData.bedding?.blanketsCount ?? ''}
                                onChange={e => handleChange('bedding', 'blanketsCount', parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <YesNoToggle
                            label={t('owner_req.bedding.exchange')}
                            value={formData.bedding?.hasExchangeLinen}
                            onChange={v => handleChange('bedding', 'hasExchangeLinen', v)}
                        />
                    </div>
                )}
            </div>

            {/* 3. Consumables */}
            <div className={`${styles.expandableSection} ${expanded.consumables ? styles.expanded : ''}`}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('consumables')}>
                    <h4>{t('owner_req.consumables.title')}</h4>
                    <span className={styles.expandIcon}>▼</span>
                </div>
                {expanded.consumables && (
                    <div className={styles.sectionContent}>
                        <div className={styles.fullWidth}>
                            <label className={styles.toggleLabel} style={{ marginBottom: '0.5rem', display: 'block' }}>{t('owner_req.consumables.products')}</label>
                            <textarea
                                className={styles.textarea}
                                rows={3}
                                value={formData.consumables?.productsProvided || ''}
                                onChange={e => handleChange('consumables', 'productsProvided', e.target.value)}
                            />
                        </div>
                        <div className={styles.grid}>
                            <Input
                                label={t('owner_req.consumables.refill')}
                                value={formData.consumables?.whoRefills || ''}
                                onChange={e => handleChange('consumables', 'whoRefills', e.target.value)}
                            />
                            <div className={styles.inlineFields}>
                                <div style={{ flex: 1 }}>
                                    <Input
                                        label={t('owner_req.consumables.budget')}
                                        type="number"
                                        min={0}
                                        value={formData.consumables?.approxBudget ?? ''}
                                        onChange={e => handleChange('consumables', 'approxBudget', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div style={{ width: '100px' }}>
                                    <Select
                                        label={t('owner_req.consumables.currency')}
                                        value={formData.consumables?.approxBudgetCurrency || 'CAD'}
                                        onChange={e => handleChange('consumables', 'approxBudgetCurrency', e.target.value)}
                                        options={[
                                            { value: 'CAD', label: 'CAD ($)' },
                                            { value: 'USD', label: 'USD ($)' },
                                            { value: 'EUR', label: 'EUR (€)' },
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>


            {/* 5. Propane / BBQ */}
            <div className={`${styles.expandableSection} ${expanded.bbq ? styles.expanded : ''}`}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('bbq')}>
                    <h4>{t('owner_req.bbq.title')}</h4>
                    <span className={styles.expandIcon}>▼</span>
                </div>
                {expanded.bbq && (
                    <div className={styles.sectionContent}>
                        <YesNoToggle
                            label={t('owner_req.bbq.propane')}
                            value={formData.bbq?.hasPropane}
                            onChange={v => handleChange('bbq', 'hasPropane', v)}
                        />
                        <YesNoToggle
                            label={t('owner_req.bbq.gauge')}
                            value={formData.bbq?.hasGauge}
                            onChange={v => handleChange('bbq', 'hasGauge', v)}
                        />
                        <div className={styles.fullWidth}>
                            <label className={styles.toggleLabel} style={{ marginBottom: '0.5rem', display: 'block' }}>{t('owner_req.bbq.procedure')}</label>
                            <textarea
                                className={styles.textarea}
                                rows={3}
                                value={formData.bbq?.emptyBottleProcedure || ''}
                                onChange={e => handleChange('bbq', 'emptyBottleProcedure', e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 6. Emergency Kit */}
            <div className={`${styles.expandableSection} ${expanded.emergency ? styles.expanded : ''}`}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('emergency')}>
                    <h4>{t('owner_req.emergency.title')}</h4>
                    <span className={styles.expandIcon}>▼</span>
                </div>
                {expanded.emergency && (
                    <div className={styles.sectionContent}>
                        <YesNoToggle
                            label={t('owner_req.emergency.presence')}
                            value={formData.emergencyKit?.hasKit}
                            onChange={v => handleChange('emergencyKit', 'hasKit', v)}
                        />
                        <div className={styles.fullWidth}>
                            <label className={styles.toggleLabel} style={{ marginBottom: '0.8rem', display: 'block' }}>{t('owner_req.emergency.content')}</label>
                            <div className={styles.checklistGrid}>
                                {[
                                    { key: 'first_aid', label: t('owner_req.emergency.first_aid') },
                                    { key: 'flashlight', label: t('owner_req.emergency.flashlight') },
                                    { key: 'batteries', label: t('owner_req.emergency.batteries') }
                                ].map(item => (
                                    <label key={item.key} className={styles.checkItem}>
                                        <input
                                            type="checkbox"
                                            checked={(formData.emergencyKit?.kitContents || []).includes(item.key)}
                                            onChange={e => {
                                                const current = formData.emergencyKit?.kitContents || [];
                                                const updated = e.target.checked
                                                    ? [...current, item.key]
                                                    : current.filter((k: string) => k !== item.key);
                                                handleChange('emergencyKit', 'kitContents', updated);
                                            }}
                                        />
                                        {item.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <Input
                            label={t('owner_req.emergency.location')}
                            value={formData.emergencyKit?.kitLocation || ''}
                            onChange={e => handleChange('emergencyKit', 'kitLocation', e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* 7. Expense Authorization */}
            <div className={`${styles.expandableSection} ${expanded.expense ? styles.expanded : ''}`}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('expense')}>
                    <h4>{t('owner_req.expense.title')}</h4>
                    <span className={styles.expandIcon}>▼</span>
                </div>
                {expanded.expense && (
                    <div className={styles.sectionContent}>
                        <Input
                            label={t('owner_req.expense.max_amount')}
                            type="number"
                            min={0}
                            value={formData.expenseAuth?.maxAmountNoValidation ?? ''}
                            onChange={e => handleChange('expenseAuth', 'maxAmountNoValidation', parseFloat(e.target.value) || 0)}
                        />
                        <div className={styles.fullWidth}>
                            <label className={styles.toggleLabel} style={{ marginBottom: '0.5rem', display: 'block' }}>{t('owner_req.expense.types')}</label>
                            <textarea
                                className={styles.textarea}
                                rows={3}
                                value={formData.expenseAuth?.allowedExpenseTypes || ''}
                                onChange={e => handleChange('expenseAuth', 'allowedExpenseTypes', e.target.value)}
                            />
                        </div>
                        <Select
                            label={t('owner_req.expense.comm_mode')}
                            value={formData.expenseAuth?.preferredCommMode || ''}
                            onChange={e => handleChange('expenseAuth', 'preferredCommMode', e.target.value)}
                            options={[
                                { value: 'phone', label: 'Téléphone' },
                                { value: 'sms', label: 'SMS' },
                                { value: 'email', label: 'Email' },
                                { value: 'whatsapp', label: 'WhatsApp' },
                                { value: 'other', label: 'Autre' },
                            ]}
                        />
                    </div>
                )}
            </div>

            <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '2rem' }}>
                <Button variant="outline" onClick={onBack}>{t('step.back')}</Button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="outline" onClick={handleSave} style={{ borderColor: 'var(--primary-blue)', color: 'var(--primary-blue)' }}>
                        {t('owner_req.common.save')}
                    </Button>
                    <Button size="lg" onClick={() => { handleSave(); onNext(); }} className={styles.nextBtn}>
                        {t('step.next')} →
                    </Button>
                </div>
            </div>
        </div>
    );
}
