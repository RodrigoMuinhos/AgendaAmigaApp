import { useState } from 'react';
import { CheckCircle2, Compass, FileCheck, HeartHandshake, Home, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

const quickTips = [
  {
    icon: Home,
    titleKey: 'loginSuccess.tipDashboardTitle',
    descriptionKey: 'loginSuccess.tipDashboardDesc',
    defaultTitle: 'Painel inicial',
    defaultDescription: 'Acompanhe a rotina do dia, proximas consultas e alertas importantes.',
  },
  {
    icon: HeartHandshake,
    titleKey: 'loginSuccess.tipFamilyTitle',
    descriptionKey: 'loginSuccess.tipFamilyDesc',
    defaultTitle: 'Familia conectada',
    defaultDescription: 'Convide cuidadores e compartilhe informacoes em tempo real.',
  },
  {
    icon: FileCheck,
    titleKey: 'loginSuccess.tipRecordsTitle',
    descriptionKey: 'loginSuccess.tipRecordsDesc',
    defaultTitle: 'Registros centralizados',
    defaultDescription: 'Organize prescricoes, exames e relatorios sem perder nada.',
  },
  {
    icon: Compass,
    titleKey: 'loginSuccess.tipGuideTitle',
    descriptionKey: 'loginSuccess.tipGuideDesc',
    defaultTitle: 'Guia de uso completo',
    defaultDescription: 'Veja o passo a passo para aproveitar cada funcionalidade.',
  },
];

export function LoginSuccessPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const email = params.get('email') ?? '';
  const provider = params.get('provider') ?? '';

  const friendlyProvider = provider
    ? t(`loginSuccess.provider.${provider}`, provider === 'google' ? 'Google' : provider)
    : t('loginSuccess.provider.default', 'sua conta');

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-bg))] via-[rgba(var(--color-primary),0.05)] to-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]">
        <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-12 sm:px-10">
          <div className="rounded-[36px] border border-[rgba(var(--color-border),0.35)] bg-[rgb(var(--color-surface))] p-10 shadow-elevated backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6 text-center">
            <span className="inline-flex items-center justify-center rounded-full bg-[rgba(var(--color-primary),0.12)] p-4 text-[rgb(var(--color-primary))] shadow-soft">
              <CheckCircle2 className="h-12 w-12" aria-hidden />
            </span>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                {t('loginSuccess.title', 'Acesso confirmado!')}
              </h1>
              <p className="text-base text-[rgba(var(--color-text),0.7)]">
                {email
                  ? t('loginSuccess.subtitleWithEmail', {
                      defaultValue: 'Bem-vindo(a), {{email}}. Voce entrou com {{provider}}.',
                      email,
                      provider: friendlyProvider,
                    })
                  : t('loginSuccess.subtitle', 'Bem-vindo(a)! Seu login foi confirmado com sucesso.')}
              </p>
              <p className="text-sm text-[rgba(var(--color-text),0.6)]">
                {t(
                  'loginSuccess.nextSteps',
                  'Revise os principais recursos abaixo antes de continuar para o aplicativo.',
                )}
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Button asChild className="min-w-[220px]" disabled={!acceptedTerms}>
                <Link to="/inicio">{t('loginSuccess.goToApp', 'Entrar na Agenda Amiga')}</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="min-w-[220px] border border-[rgba(var(--color-border),0.35)] bg-[rgba(var(--color-surface),0.9)] text-[rgb(var(--color-primary))]"
              >
                <a
                  href="https://agendaamiga.app/guia"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <Sparkles className="h-5 w-5" aria-hidden />
                  {t('loginSuccess.openGuide', 'Abrir guia completo')}
                </a>
              </Button>
            </div>
            <div className="mt-6 flex w-full max-w-xl items-start justify-center gap-3 rounded-[20px] border border-[rgba(var(--color-border),0.25)] bg-[rgba(var(--color-surface),0.95)] px-4 py-3 text-left">
              <Checkbox
                id="lgpd-consent"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <label htmlFor="lgpd-consent" className="text-sm text-[rgba(var(--color-text),0.75)]">
                {t(
                  'loginSuccess.lgpdConsent',
                  'Li e aceito os termos de tratamento de dados conforme a LGPD.',
                )}{' '}
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  className="font-semibold text-[rgb(var(--color-primary))] underline underline-offset-4 transition hover:text-[rgba(var(--color-primary),0.8)]"
                >
                  {t('loginSuccess.learnMore', 'Saiba mais')}
                </button>
              </label>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {quickTips.map((tip) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.titleKey}
                  className="rounded-[28px] border border-[rgba(var(--color-border),0.2)] bg-[rgba(var(--color-surface),0.95)] p-5 shadow-soft transition hover:border-[rgba(var(--color-primary),0.35)] hover:shadow-elevated"
                >
                  <div className="mb-3 flex items-center gap-3 text-[rgb(var(--color-primary))]">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--color-primary),0.12)]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h2 className="text-base font-semibold">
                      {t(tip.titleKey, tip.defaultTitle)}
                    </h2>
                  </div>
                  <p className="text-sm text-[rgba(var(--color-text),0.7)]">
                    {t(tip.descriptionKey, tip.defaultDescription)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-[24px] border border-[rgba(var(--color-border),0.2)] bg-[rgba(var(--color-primary),0.1)] p-5 text-sm text-[rgba(var(--color-text),0.75)]">
            {t(
              'loginSuccess.footerHint',
              'Dica: voce pode acessar este painel novamente a qualquer momento pelo menu do avatar no canto superior direito.',
            )}
          </div>
        </div>
      </div>
      </div>

      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {t('loginSuccess.terms.title', 'Termos de tratamento de dados pessoais')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'loginSuccess.terms.subtitle',
                'Resumimos abaixo como cuidamos dos seus dados e os direitos garantidos pela LGPD.',
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-2 text-sm text-[rgba(var(--color-text),0.75)]">
            <section className="space-y-2">
              <h3 className="text-base font-semibold text-[rgb(var(--color-primary))]">
                {t('loginSuccess.terms.section1.title', 'Finalidade do tratamento')}
              </h3>
              <p>
                {t(
                  'loginSuccess.terms.section1.item1',
                  'Utilizamos seus dados pessoais para operacionalizar o Agenda Amiga, garantindo funcionalidades essenciais como autenticação segura, personalização da experiência, organização de informações clínicas e comunicação entre os cuidadores autorizados.',
                )}
              </p>
              <p>
                {t(
                  'loginSuccess.terms.section1.item2',
                  'Coletamos apenas dados necessários para prestação dos serviços, tais como identificação, dados de contato, relacionamentos familiares, registros de tratamentos, prescrições, lembretes de doses e dados de acesso (logs, IP, dispositivo).',
                )}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-[rgb(var(--color-primary))]">
                {t('loginSuccess.terms.section2.title', 'Bases legais utilizadas')}
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  {t(
                    'loginSuccess.terms.section2.item1',
                    'Consentimento do titular para funcionalidades opcionais, convites de cuidadores e envio de comunicações personalizadas.',
                  )}
                </li>
                <li>
                  {t(
                    'loginSuccess.terms.section2.item2',
                    'Execução de contrato para viabilizar o acesso ao Agenda Amiga e cumprir obrigações assumidas com o titular ou seu representante legal.',
                  )}
                </li>
                <li>
                  {t(
                    'loginSuccess.terms.section2.item3',
                    'Cumprimento de obrigação legal ou regulatória, incluindo deveres sanitários e contábeis aplicáveis aos serviços oferecidos.',
                  )}
                </li>
                <li>
                  {t(
                    'loginSuccess.terms.section2.item4',
                    'Proteção da vida ou da incolumidade física em situações emergenciais, possibilitando alertas e compartilhamento de informações críticas.',
                  )}
                </li>
                <li>
                  {t(
                    'loginSuccess.terms.section2.item5',
                    'Legítimo interesse para aprimorar a plataforma, garantir segurança, prevenir fraudes e realizar análises estatísticas, sempre observando os direitos do titular.',
                  )}
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-[rgb(var(--color-primary))]">
                {t('loginSuccess.terms.section3.title', 'Compartilhamento e operadores')}
              </h3>
              <p>
                {t(
                  'loginSuccess.terms.section3.item1',
                  'Compartilhamos dados com provedores de infraestrutura, autenticação, telecomunicações e suporte técnico que atuam como operadores contratados e seguem padrões rígidos de confidencialidade e segurança.',
                )}
              </p>
              <p>
                {t(
                  'loginSuccess.terms.section3.item2',
                  'Dados poderão ser compartilhados com profissionais de saúde, clínicas ou hospitais vinculados à sua equipe de cuidado, mediante autorização expressa sua ou de seu representante legal.',
                )}
              </p>
              <p>
                {t(
                  'loginSuccess.terms.section3.item3',
                  'Não vendemos dados pessoais a terceiros. Toda transferência internacional segue os requisitos da LGPD e contratos específicos de proteção.',
                )}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-[rgb(var(--color-primary))]">
                {t('loginSuccess.terms.section4.title', 'Direitos do titular')}
              </h3>
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  {t(
                    'loginSuccess.terms.section4.item1',
                    'Confirmação da existência de tratamento e acesso aos dados pessoais mantidos pelo Agenda Amiga.',
                  )}
                </li>
                <li>
                  {t(
                    'loginSuccess.terms.section4.item2',
                    'Correção de dados incompletos, inexatos ou desatualizados, mediante solicitação nos canais oficiais.',
                  )}
                </li>
                <li>
                  {t(
                    'loginSuccess.terms.section4.item3',
                    'Portabilidade dos dados a outro fornecedor de serviço ou produto, observados os segredos comercial e industrial.',
                  )}
                </li>
                <li>
                  {t(
                    'loginSuccess.terms.section4.item4',
                    'Eliminação de dados tratados com base no consentimento, salvo hipóteses de guarda legal ou legítimo interesse fundamentado.',
                  )}
                </li>
                <li>
                  {t(
                    'loginSuccess.terms.section4.item5',
                    'Informação sobre entidades públicas e privadas com as quais realizamos uso compartilhado de dados.',
                  )}
                </li>
                <li>
                  {t(
                    'loginSuccess.terms.section4.item6',
                    'Revogação de consentimentos e oposição ao tratamento em desacordo com a LGPD.',
                  )}
                </li>
              </ul>
              <p>
                {t(
                  'loginSuccess.terms.section4.item7',
                  'Para exercer seus direitos, entre em contato pelo e-mail privacidade@agendaamiga.app ou utilize as opções de privacidade dentro do aplicativo.',
                )}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-[rgb(var(--color-primary))]">
                {t('loginSuccess.terms.section5.title', 'Segurança e retenção')}
              </h3>
              <p>
                {t(
                  'loginSuccess.terms.section5.item1',
                  'Adotamos controles técnicos, criptografia, gestão de acessos, monitoramento, revisões periódicas e treinamentos para prevenir incidentes de segurança.',
                )}
              </p>
              <p>
                {t(
                  'loginSuccess.terms.section5.item2',
                  'Os dados são mantidos pelo tempo necessário ao atendimento das finalidades informadas e obrigações legais. Após esse período, anonimizamos ou eliminamos os registros, salvo quando houver fundamento jurídico para retenção.',
                )}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-semibold text-[rgb(var(--color-primary))]">
                {t('loginSuccess.terms.section6.title', 'Atualizações desta política')}
              </h3>
              <p>
                {t(
                  'loginSuccess.terms.section6.item1',
                  'Podemos atualizar estes termos para refletir mudanças regulatórias ou novos recursos. Sempre comunicaremos as alterações relevantes e manteremos o histórico disponível em agendaamiga.app/privacidade.',
                )}
              </p>
              <p>
                {t(
                  'loginSuccess.terms.section6.item2',
                  'A política completa, inclusive definições, agentes de tratamento, Encarregado (DPO) e canais de contato, pode ser consultada na íntegra em nosso site.',
                )}
              </p>
            </section>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setTermsOpen(false)}>
              {t('loginSuccess.terms.close', 'Fechar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
