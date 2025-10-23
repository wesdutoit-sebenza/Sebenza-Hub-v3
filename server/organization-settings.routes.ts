import { Router, type Request, type Response, type NextFunction } from "express";
import pg from "pg";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "./auth";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const router = Router();

// Middleware to validate organization membership
async function requireOrgMembership(req: AuthRequest, res: Response, next: NextFunction) {
  const { orgId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Check if user is a member of the organization
  const { rows } = await pool.query(
    `SELECT role FROM memberships WHERE user_id = $1 AND organization_id = $2`,
    [userId, orgId]
  );

  if (rows.length === 0) {
    return res.status(403).json({ error: "Access denied to this organization" });
  }

  next();
}

// ============================================
// TEAM MEMBERS
// ============================================

router.get("/organizations/:orgId/team-members", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { rows } = await pool.query(
    `SELECT * FROM team_members WHERE organization_id = $1 ORDER BY invited_at DESC`,
    [orgId]
  );
  res.json(rows);
});

router.post("/organizations/:orgId/team-members", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { email, role, permissions, status } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO team_members(organization_id, email, role, permissions, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [orgId, email, role, permissions || [], status || 'pending']
  );
  res.json(rows[0]);
});

router.patch("/organizations/:orgId/team-members/:memberId", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId, memberId } = req.params;
  const { email, role, permissions, status, acceptedAt } = req.body;
  
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  if (email !== undefined) {
    updates.push(`email = $${paramCount++}`);
    values.push(email);
  }
  if (role !== undefined) {
    updates.push(`role = $${paramCount++}`);
    values.push(role);
  }
  if (permissions !== undefined) {
    updates.push(`permissions = $${paramCount++}`);
    values.push(permissions);
  }
  if (status !== undefined) {
    updates.push(`status = $${paramCount++}`);
    values.push(status);
  }
  if (acceptedAt !== undefined) {
    updates.push(`accepted_at = $${paramCount++}`);
    values.push(acceptedAt);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }
  
  values.push(memberId, orgId);
  const { rows } = await pool.query(
    `UPDATE team_members SET ${updates.join(', ')}
     WHERE id = $${paramCount} AND organization_id = $${paramCount + 1}
     RETURNING *`,
    values
  );
  
  if (rows.length === 0) {
    return res.status(404).json({ error: "Team member not found" });
  }
  
  res.json(rows[0]);
});

router.delete("/organizations/:orgId/team-members/:memberId", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId, memberId } = req.params;
  const { rows } = await pool.query(
    `DELETE FROM team_members WHERE id = $1 AND organization_id = $2 RETURNING id`,
    [memberId, orgId]
  );
  
  if (rows.length === 0) {
    return res.status(404).json({ error: "Team member not found" });
  }
  
  res.json({ ok: true });
});

// ============================================
// PIPELINE STAGES
// ============================================

router.get("/organizations/:orgId/pipeline-stages", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { rows } = await pool.query(
    `SELECT * FROM pipeline_stages WHERE organization_id = $1 ORDER BY "order"`,
    [orgId]
  );
  res.json(rows);
});

router.post("/organizations/:orgId/pipeline-stages", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { name, order, isDefault } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO pipeline_stages(organization_id, name, "order", is_default)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [orgId, name, order, isDefault || 0]
  );
  res.json(rows[0]);
});

router.patch("/organizations/:orgId/pipeline-stages/:stageId", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId, stageId } = req.params;
  const { name, order, isDefault } = req.body;
  
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  if (name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(name);
  }
  if (order !== undefined) {
    updates.push(`"order" = $${paramCount++}`);
    values.push(order);
  }
  if (isDefault !== undefined) {
    updates.push(`is_default = $${paramCount++}`);
    values.push(isDefault);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }
  
  values.push(stageId, orgId);
  const { rows } = await pool.query(
    `UPDATE pipeline_stages SET ${updates.join(', ')}
     WHERE id = $${paramCount} AND organization_id = $${paramCount + 1}
     RETURNING *`,
    values
  );
  
  if (rows.length === 0) {
    return res.status(404).json({ error: "Pipeline stage not found" });
  }
  
  res.json(rows[0]);
});

router.delete("/organizations/:orgId/pipeline-stages/:stageId", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId, stageId } = req.params;
  const { rows } = await pool.query(
    `DELETE FROM pipeline_stages WHERE id = $1 AND organization_id = $2 RETURNING id`,
    [stageId, orgId]
  );
  
  if (rows.length === 0) {
    return res.status(404).json({ error: "Pipeline stage not found" });
  }
  
  res.json({ ok: true });
});

// ============================================
// INTERVIEW SETTINGS
// ============================================

router.get("/organizations/:orgId/interview-settings", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { rows } = await pool.query(
    `SELECT * FROM interview_settings WHERE organization_id = $1`,
    [orgId]
  );
  
  if (rows.length === 0) {
    const { rows: newRows } = await pool.query(
      `INSERT INTO interview_settings(organization_id, calendar_provider, video_provider)
       VALUES ($1, 'none', 'none')
       RETURNING *`,
      [orgId]
    );
    return res.json(newRows[0]);
  }
  
  res.json(rows[0]);
});

router.put("/organizations/:orgId/interview-settings", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { calendarProvider, videoProvider, panelTemplates, feedbackFormTemplate } = req.body;
  
  const { rows: existing } = await pool.query(
    `SELECT id FROM interview_settings WHERE organization_id = $1`,
    [orgId]
  );
  
  if (existing.length === 0) {
    const { rows } = await pool.query(
      `INSERT INTO interview_settings(organization_id, calendar_provider, video_provider, panel_templates, feedback_form_template)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [orgId, calendarProvider || 'none', videoProvider || 'none', panelTemplates || [], feedbackFormTemplate || '']
    );
    return res.json(rows[0]);
  }
  
  const { rows } = await pool.query(
    `UPDATE interview_settings 
     SET calendar_provider = $1, video_provider = $2, panel_templates = $3, 
         feedback_form_template = $4, updated_at = NOW()
     WHERE organization_id = $5
     RETURNING *`,
    [calendarProvider, videoProvider, panelTemplates || [], feedbackFormTemplate || '', orgId]
  );
  
  res.json(rows[0]);
});

// ============================================
// COMPLIANCE SETTINGS
// ============================================

router.get("/organizations/:orgId/compliance-settings", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { rows } = await pool.query(
    `SELECT * FROM compliance_settings WHERE organization_id = $1`,
    [orgId]
  );
  
  if (rows.length === 0) {
    const { rows: newRows } = await pool.query(
      `INSERT INTO compliance_settings(organization_id)
       VALUES ($1)
       RETURNING *`,
      [orgId]
    );
    return res.json(newRows[0]);
  }
  
  res.json(rows[0]);
});

router.put("/organizations/:orgId/compliance-settings", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { eeDataCapture, consentText, dataRetentionDays, popiaOfficer, dataDeletionContact } = req.body;
  
  const { rows: existing } = await pool.query(
    `SELECT id FROM compliance_settings WHERE organization_id = $1`,
    [orgId]
  );
  
  if (existing.length === 0) {
    const { rows } = await pool.query(
      `INSERT INTO compliance_settings(organization_id, ee_data_capture, consent_text, 
                                        data_retention_days, popia_officer, data_deletion_contact)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [orgId, eeDataCapture || 'optional', consentText, dataRetentionDays || 365, popiaOfficer, dataDeletionContact]
    );
    return res.json(rows[0]);
  }
  
  const { rows } = await pool.query(
    `UPDATE compliance_settings 
     SET ee_data_capture = $1, consent_text = $2, data_retention_days = $3,
         popia_officer = $4, data_deletion_contact = $5, updated_at = NOW()
     WHERE organization_id = $6
     RETURNING *`,
    [eeDataCapture, consentText, dataRetentionDays, popiaOfficer, dataDeletionContact, orgId]
  );
  
  res.json(rows[0]);
});

// ============================================
// ORGANIZATION INTEGRATIONS
// ============================================

router.get("/organizations/:orgId/integrations", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { rows } = await pool.query(
    `SELECT * FROM organization_integrations WHERE organization_id = $1`,
    [orgId]
  );
  
  if (rows.length === 0) {
    const { rows: newRows } = await pool.query(
      `INSERT INTO organization_integrations(organization_id)
       VALUES ($1)
       RETURNING *`,
      [orgId]
    );
    return res.json(newRows[0]);
  }
  
  res.json(rows[0]);
});

router.put("/organizations/:orgId/integrations", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { slackWebhook, msTeamsWebhook, atsProvider, atsApiKey, sourcingChannels } = req.body;
  
  const { rows: existing } = await pool.query(
    `SELECT id FROM organization_integrations WHERE organization_id = $1`,
    [orgId]
  );
  
  if (existing.length === 0) {
    const { rows } = await pool.query(
      `INSERT INTO organization_integrations(organization_id, slack_webhook, ms_teams_webhook,
                                              ats_provider, ats_api_key, sourcing_channels)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [orgId, slackWebhook, msTeamsWebhook, atsProvider, atsApiKey, sourcingChannels || []]
    );
    return res.json(rows[0]);
  }
  
  const { rows } = await pool.query(
    `UPDATE organization_integrations 
     SET slack_webhook = $1, ms_teams_webhook = $2, ats_provider = $3,
         ats_api_key = $4, sourcing_channels = $5, updated_at = NOW()
     WHERE organization_id = $6
     RETURNING *`,
    [slackWebhook, msTeamsWebhook, atsProvider, atsApiKey, sourcingChannels || [], orgId]
  );
  
  res.json(rows[0]);
});

// ============================================
// JOB TEMPLATES
// ============================================

router.get("/organizations/:orgId/job-templates", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { rows } = await pool.query(
    `SELECT * FROM job_templates WHERE organization_id = $1 ORDER BY created_at DESC`,
    [orgId]
  );
  res.json(rows);
});

router.post("/organizations/:orgId/job-templates", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { name, jobTitle, jobDescription, requirements, interviewStructure, approvalChain } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO job_templates(organization_id, name, job_title, job_description, 
                                requirements, interview_structure, approval_chain)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [orgId, name, jobTitle, jobDescription, requirements || [], interviewStructure || [], approvalChain || []]
  );
  res.json(rows[0]);
});

router.patch("/organizations/:orgId/job-templates/:templateId", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId, templateId } = req.params;
  const { name, jobTitle, jobDescription, requirements, interviewStructure, approvalChain } = req.body;
  
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  if (name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(name);
  }
  if (jobTitle !== undefined) {
    updates.push(`job_title = $${paramCount++}`);
    values.push(jobTitle);
  }
  if (jobDescription !== undefined) {
    updates.push(`job_description = $${paramCount++}`);
    values.push(jobDescription);
  }
  if (requirements !== undefined) {
    updates.push(`requirements = $${paramCount++}`);
    values.push(requirements);
  }
  if (interviewStructure !== undefined) {
    updates.push(`interview_structure = $${paramCount++}`);
    values.push(interviewStructure);
  }
  if (approvalChain !== undefined) {
    updates.push(`approval_chain = $${paramCount++}`);
    values.push(approvalChain);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }
  
  updates.push(`updated_at = NOW()`);
  values.push(templateId, orgId);
  const { rows } = await pool.query(
    `UPDATE job_templates SET ${updates.join(', ')}
     WHERE id = $${paramCount} AND organization_id = $${paramCount + 1}
     RETURNING *`,
    values
  );
  
  if (rows.length === 0) {
    return res.status(404).json({ error: "Job template not found" });
  }
  
  res.json(rows[0]);
});

router.delete("/organizations/:orgId/job-templates/:templateId", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId, templateId } = req.params;
  const { rows } = await pool.query(
    `DELETE FROM job_templates WHERE id = $1 AND organization_id = $2 RETURNING id`,
    [templateId, orgId]
  );
  
  if (rows.length === 0) {
    return res.status(404).json({ error: "Job template not found" });
  }
  
  res.json({ ok: true });
});

// ============================================
// SALARY BANDS
// ============================================

router.get("/organizations/:orgId/salary-bands", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { rows } = await pool.query(
    `SELECT * FROM salary_bands WHERE organization_id = $1 ORDER BY created_at DESC`,
    [orgId]
  );
  res.json(rows);
});

router.post("/organizations/:orgId/salary-bands", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { title, minSalary, maxSalary, currency } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO salary_bands(organization_id, title, min_salary, max_salary, currency)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [orgId, title, minSalary, maxSalary, currency || 'ZAR']
  );
  res.json(rows[0]);
});

router.patch("/organizations/:orgId/salary-bands/:bandId", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId, bandId } = req.params;
  const { title, minSalary, maxSalary, currency } = req.body;
  
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  if (title !== undefined) {
    updates.push(`title = $${paramCount++}`);
    values.push(title);
  }
  if (minSalary !== undefined) {
    updates.push(`min_salary = $${paramCount++}`);
    values.push(minSalary);
  }
  if (maxSalary !== undefined) {
    updates.push(`max_salary = $${paramCount++}`);
    values.push(maxSalary);
  }
  if (currency !== undefined) {
    updates.push(`currency = $${paramCount++}`);
    values.push(currency);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }
  
  values.push(bandId, orgId);
  const { rows } = await pool.query(
    `UPDATE salary_bands SET ${updates.join(', ')}
     WHERE id = $${paramCount} AND organization_id = $${paramCount + 1}
     RETURNING *`,
    values
  );
  
  if (rows.length === 0) {
    return res.status(404).json({ error: "Salary band not found" });
  }
  
  res.json(rows[0]);
});

router.delete("/organizations/:orgId/salary-bands/:bandId", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId, bandId } = req.params;
  const { rows } = await pool.query(
    `DELETE FROM salary_bands WHERE id = $1 AND organization_id = $2 RETURNING id`,
    [bandId, orgId]
  );
  
  if (rows.length === 0) {
    return res.status(404).json({ error: "Salary band not found" });
  }
  
  res.json({ ok: true });
});

// ============================================
// APPROVED VENDORS
// ============================================

router.get("/organizations/:orgId/vendors", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { rows } = await pool.query(
    `SELECT * FROM approved_vendors WHERE organization_id = $1 ORDER BY created_at DESC`,
    [orgId]
  );
  res.json(rows);
});

router.post("/organizations/:orgId/vendors", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId } = req.params;
  const { name, contactEmail, rate, ndaSigned, status } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO approved_vendors(organization_id, name, contact_email, rate, nda_signed, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [orgId, name, contactEmail, rate, ndaSigned || 0, status || 'active']
  );
  res.json(rows[0]);
});

router.patch("/organizations/:orgId/vendors/:vendorId", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId, vendorId } = req.params;
  const { name, contactEmail, rate, ndaSigned, status } = req.body;
  
  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  if (name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(name);
  }
  if (contactEmail !== undefined) {
    updates.push(`contact_email = $${paramCount++}`);
    values.push(contactEmail);
  }
  if (rate !== undefined) {
    updates.push(`rate = $${paramCount++}`);
    values.push(rate);
  }
  if (ndaSigned !== undefined) {
    updates.push(`nda_signed = $${paramCount++}`);
    values.push(ndaSigned);
  }
  if (status !== undefined) {
    updates.push(`status = $${paramCount++}`);
    values.push(status);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }
  
  values.push(vendorId, orgId);
  const { rows } = await pool.query(
    `UPDATE approved_vendors SET ${updates.join(', ')}
     WHERE id = $${paramCount} AND organization_id = $${paramCount + 1}
     RETURNING *`,
    values
  );
  
  if (rows.length === 0) {
    return res.status(404).json({ error: "Vendor not found" });
  }
  
  res.json(rows[0]);
});

router.delete("/organizations/:orgId/vendors/:vendorId", requireAuth, requireOrgMembership, async (req: AuthRequest, res) => {
  const { orgId, vendorId } = req.params;
  const { rows } = await pool.query(
    `DELETE FROM approved_vendors WHERE id = $1 AND organization_id = $2 RETURNING id`,
    [vendorId, orgId]
  );
  
  if (rows.length === 0) {
    return res.status(404).json({ error: "Vendor not found" });
  }
  
  res.json({ ok: true });
});

export default router;
