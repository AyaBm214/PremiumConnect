import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Property } from '@/lib/types';
import styles from './Step.module.css';
import { useLanguage } from '@/lib/LanguageContext';

interface Step8Props {
    data?: Property['data']['financials'];
    onUpdate: (data: Property['data']['financials']) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function Step8Financials({ data, onUpdate, onNext, onBack }: Step8Props) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<any>(data || { fixedCosts: {}, variableCosts: {} });
    const financials = formData;

    const handleFixedChange = (field: string, value: string) => {
        const numValue = value === '' ? 0 : parseFloat(value);
        const updated = {
            ...formData,
            fixedCosts: { ...formData.fixedCosts, [field]: numValue }
        };
        setFormData(updated);
        onUpdate(updated);
    };

    const handleVariableChange = (field: string, value: string) => {
        const numValue = value === '' ? 0 : parseFloat(value);
        const updated = {
            ...formData,
            variableCosts: { ...formData.variableCosts, [field]: numValue }
        };
        setFormData(updated);
        onUpdate(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <header className={styles.stepHeader}>
                <h3 className={styles.sectionTitle}>{t('financials.title')}</h3>
                <p className={styles.sectionSubtitle}>{t('financials.subtitle')}</p>
            </header>

            <div className={styles.financialsGrid}>
                {/* Fixed Costs Column */}
                <div className={styles.financialColumn}>
                    <div className={styles.columnHeader}>
                        <span className={styles.columnIcon}>📊</span>
                        <h4>{t('financials.fixed.title')}</h4>
                    </div>
                    <div className={styles.inputList}>
                        <Input
                            label={t('financials.fixed.municipal_taxes')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.municipalTaxes || ''}
                            onChange={(e) => handleFixedChange('municipalTaxes', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.school_taxes')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.schoolTaxes || ''}
                            onChange={(e) => handleFixedChange('schoolTaxes', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.water_taxes')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.waterTaxes || ''}
                            onChange={(e) => handleFixedChange('waterTaxes', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.insurance')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.insurance || ''}
                            onChange={(e) => handleFixedChange('insurance', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.advertising')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.advertising || ''}
                            onChange={(e) => handleFixedChange('advertising', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.citq')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.citqFee || ''}
                            onChange={(e) => handleFixedChange('citqFee', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.admin_fee')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.adminFee || ''}
                            onChange={(e) => handleFixedChange('adminFee', e.target.value)}
                            placeholder="e.g. 15"
                        />
                        <Input
                            label={t('financials.fixed.cleaning_per_stay')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.cleaningPerStay || ''}
                            onChange={(e) => handleFixedChange('cleaningPerStay', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.snow_removal')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.snowRemoval || ''}
                            onChange={(e) => handleFixedChange('snowRemoval', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.lawn_landscaping')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.lawnLandscaping || ''}
                            onChange={(e) => handleFixedChange('lawnLandscaping', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.maintenance_monthly')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.maintenanceMonthly || ''}
                            onChange={(e) => handleFixedChange('maintenanceMonthly', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.exterminator')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.exterminator || ''}
                            onChange={(e) => handleFixedChange('exterminator', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.association_fee')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.associationFee || ''}
                            onChange={(e) => handleFixedChange('associationFee', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.accounting')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.accounting || ''}
                            onChange={(e) => handleFixedChange('accounting', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.mortgage')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.mortgage || ''}
                            onChange={(e) => handleFixedChange('mortgage', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.fixed.misc_percent')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.fixedCosts?.miscPercent || ''}
                            onChange={(e) => handleFixedChange('miscPercent', e.target.value)}
                            placeholder="e.g. 5"
                        />
                    </div>
                </div>

                {/* Variable Costs Column */}
                <div className={styles.financialColumn}>
                    <div className={styles.columnHeader}>
                        <span className={styles.columnIcon}>📈</span>
                        <h4>{t('financials.variable.title')}</h4>
                    </div>
                    <div className={styles.inputList}>
                        <Input
                            label={t('financials.variable.appliance_rental')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.variableCosts?.applianceRental || ''}
                            onChange={(e) => handleVariableChange('applianceRental', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.variable.appliance_repair')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.variableCosts?.applianceRepair || ''}
                            onChange={(e) => handleVariableChange('applianceRepair', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.variable.waste_management')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.variableCosts?.wasteManagement || ''}
                            onChange={(e) => handleVariableChange('wasteManagement', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.variable.electricity')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.variableCosts?.electricity || ''}
                            onChange={(e) => handleVariableChange('electricity', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.variable.heating_oil_gas')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.variableCosts?.heatingOilGas || ''}
                            onChange={(e) => handleVariableChange('heatingOilGas', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.variable.wood')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.variableCosts?.wood || ''}
                            onChange={(e) => handleVariableChange('wood', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.variable.pool_spa')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.variableCosts?.poolSpa || ''}
                            onChange={(e) => handleVariableChange('poolSpa', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.variable.telecom')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.variableCosts?.telecom || ''}
                            onChange={(e) => handleVariableChange('telecom', e.target.value)}
                            placeholder="0.00"
                        />
                        <Input
                            label={t('financials.variable.condo_fees')}
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.variableCosts?.condoFees || ''}
                            onChange={(e) => handleVariableChange('condoFees', e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                <Button type="button" variant="outline" onClick={onBack} size="lg">
                    ← {t('step.back')}
                </Button>
                <Button type="submit" size="lg" className={styles.nextBtn}>
                    {t('step.next')} →
                </Button>
            </div>
        </form>
    );
}
