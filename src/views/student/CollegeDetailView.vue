<template>
  <div class="college-page" v-loading="loading">
    <template v-if="detail">
      <!-- 顶栏：Logo + 校名/地区/标签/层次 -->
      <header class="cd-header">
        <div class="header-main">
          <div class="logo-box">
            <img v-if="detail.collegeImg" :src="detail.collegeImg" alt="" />
            <div v-else class="logo-empty">无图</div>
          </div>
          <div class="intro-box">
            <div class="line1">
              <div class="school-name">{{ detail.collegeName }}</div>
              <div class="school-address" v-if="regionText">{{ regionText }}</div>
              <div v-if="detail.hasMaster" class="badge-shuo">硕</div>
              <div v-if="detail.hasDoctor" class="badge-bo">博</div>
              <div v-if="detail.canRecommend" class="badge-bao">保</div>
            </div>
            <div class="line2" v-if="detail.collegeLabels?.length">
              <div v-for="lb in detail.collegeLabels" :key="lb" class="line2-item">{{ lb }}</div>
            </div>
            <div class="line3">
              {{ detail.collegeLevel || '-' }} | {{ detail.collegeProperty || '-' }} |
              {{ detail.collegeType || '-' }} | {{ detail.collegeAdmin || '-' }}
            </div>
          </div>
        </div>
        <div class="menu-tab">院校概况</div>
      </header>

      <div class="cd-body">
        <div class="cd-body-inner">
          <div class="cd-left">
            <!-- 院校简介 -->
            <div class="left-title"><i class="red1" /><i class="red2" />院校简介</div>
            <div class="grey-box" v-if="detail.collegeInfo">
              <div class="grey-text">{{ detail.collegeInfo }}</div>
              <div class="learn-more" v-if="detail.baiduBaike">
                <a :href="detail.baiduBaike" target="_blank" rel="noopener">了解更多&gt;&gt;</a>
              </div>
            </div>
            <div class="grey-box" v-else>
              <div class="grey-text empty">暂无简介</div>
            </div>

            <!-- 建校/地区/师生比 -->
            <div class="icon-row">
              <div class="icon-item" v-if="detail.collegeTime">
                <div class="icon"><img src="/query-tools/collegeTime.44ec30dd.png" alt="" /></div>
                <div class="icon-text">{{ detail.collegeTime }}</div>
              </div>
              <div class="icon-item" v-if="detail.collegeCity || detail.collegeProvince">
                <div class="icon"><img src="/query-tools/collegeAddress.76eb74a1.png" alt="" /></div>
                <div class="icon-text">{{ detail.collegeCity || detail.collegeProvince }}</div>
              </div>
              <div class="icon-item" v-if="detail.studentTeacherRatio">
                <div class="icon ratio-icon">比</div>
                <div class="icon-text">{{ detail.studentTeacherRatio }}</div>
              </div>
            </div>

            <!-- 专业录取规则 -->
            <template v-if="detail.recruitRule">
              <div class="left-title"><i class="red1" /><i class="red2" />专业录取规则</div>
              <div class="grey-box"><div class="grey-text no-indent">{{ detail.recruitRule }}</div></div>
            </template>

            <!-- 师资力量 -->
            <template v-if="detail.teachers">
              <div class="left-title"><i class="red1" /><i class="red2" />师资力量</div>
              <div class="grey-box"><div class="grey-text">{{ detail.teachers }}</div></div>
            </template>

            <!-- 保研率详情 -->
            <template v-if="detail.graduates?.length">
              <div class="left-title"><i class="red1" /><i class="red2" />保研率详情</div>
              <div class="grey-box">
                <table class="major-table grad-table">
                  <thead>
                    <tr>
                      <th>年份</th>
                      <th>本科毕业生人数</th>
                      <th>推免人数</th>
                      <th>读研人数(国内+国外)</th>
                      <th>国内</th>
                      <th>出国(境)</th>
                      <th>保研率</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="g in detail.graduates" :key="g.year">
                      <td>{{ g.year }}</td>
                      <td>{{ dash(g.graduationNum) }}</td>
                      <td>{{ dash(g.num) }}</td>
                      <td>{{ dash(g.masterNum) }}</td>
                      <td>{{ dash(g.home) }}</td>
                      <td>{{ dash(g.abroad) }}</td>
                      <td>{{ g.masterRate || '--' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <!-- 优势学科 -->
            <template v-if="detail.advantage">
              <div class="left-title"><i class="red1" /><i class="red2" />优势学科</div>
              <div class="grey-box"><div class="grey-text">{{ detail.advantage }}</div></div>
            </template>

            <!-- 双一流建设学科 -->
            <template v-if="detail.doubleFirstClass">
              <div class="left-title"><i class="red1" /><i class="red2" />双一流建设学科</div>
              <div class="grey-box"><div class="grey-text no-indent">{{ detail.doubleFirstClass }}</div></div>
            </template>

            <!-- 专业设置 -->
            <div class="left-title"><i class="red1" /><i class="red2" />专业设置</div>
            <div class="grey-box" v-loading="majorsLoading">
              <table v-if="majorGroups.length" class="major-table">
                <thead>
                  <tr><th style="width:28%">类别</th><th>专业</th></tr>
                </thead>
                <tbody>
                  <tr v-for="g in majorGroups" :key="g.category">
                    <td>{{ g.category }}</td>
                    <td>{{ g.majorText }}</td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="grey-text empty no-indent">暂无专业数据</div>
            </div>

            <!-- 第四轮学科评估 -->
            <template v-if="detail.estimates?.length">
              <div class="left-title"><i class="red1" /><i class="red2" />第四轮学科评估</div>
              <div class="grey-box">
                <table class="major-table">
                  <thead>
                    <tr><th style="width:14%">等级</th><th>学科</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="(e, idx) in detail.estimates" :key="idx">
                      <td class="level-cell">{{ e.level }}</td>
                      <td>{{ e.majors }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <!-- 院校其他信息 -->
            <template v-if="hasOtherInfo">
              <div class="left-title"><i class="red1" /><i class="red2" />院校其他信息</div>
              <div class="grey-box other-info">
                <div class="other-row" v-if="detail.keyLab">
                  <el-tag type="danger" effect="light" class="other-tag">重点实验(实训)室</el-tag>
                  <span class="other-text">{{ detail.keyLab }}</span>
                </div>
                <div class="other-row" v-if="detail.scholarship">
                  <el-tag type="danger" effect="light" class="other-tag">奖学金设置</el-tag>
                  <span class="other-text">{{ detail.scholarship }}</span>
                </div>
                <div class="other-row" v-if="detail.accommodation">
                  <el-tag type="danger" effect="light" class="other-tag">食宿条件</el-tag>
                  <span class="other-text">{{ detail.accommodation }}</span>
                </div>
                <div class="other-row" v-if="detail.partnerEnterprise">
                  <el-tag type="danger" effect="light" class="other-tag">校招企业</el-tag>
                  <span class="other-text">{{ detail.partnerEnterprise }}</span>
                </div>
                <div class="other-row" v-if="detail.transferMajor">
                  <el-tag type="danger" effect="light" class="other-tag">转专业政策</el-tag>
                  <span class="other-text">{{ detail.transferMajor }}</span>
                </div>
                <div class="other-row" v-if="detail.famousAlumni">
                  <el-tag type="danger" effect="light" class="other-tag">知名校友</el-tag>
                  <span class="other-text">{{ detail.famousAlumni }}</span>
                </div>
              </div>
            </template>
          </div>

          <aside class="cd-right">
            <div class="right-title">实景VR</div>
            <div class="vr-box">
              <a v-if="detail.vrAddress" :href="detail.vrAddress" target="_blank" rel="noopener" class="vr-link">
                <img v-if="detail.extraPic" :src="detail.extraPic" alt="实景" />
                <div v-else class="vr-placeholder">点击查看校园实景 VR</div>
              </a>
              <template v-else>
                <img v-if="detail.extraPic" :src="detail.extraPic" alt="实景" />
                <div v-else class="vr-placeholder">暂无实景</div>
              </template>
            </div>

            <template v-if="detail.ranks?.length">
              <div class="right-title">高校排行</div>
              <div class="rank-box">
                <table class="rank-table">
                  <thead>
                    <tr><th>排行榜</th><th>院校排名</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="(r, i) in detail.ranks" :key="i">
                      <td>{{ r.rankName }}{{ r.year ? `(${r.year})` : '' }}</td>
                      <td class="rank-num">{{ r.rankValue }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <template v-if="detail.reports?.length">
              <div class="right-title">院校资讯</div>
              <div class="news-box">
                <a
                  v-for="(n, i) in detail.reports"
                  :key="i"
                  class="news-item"
                  :href="n.newsUrl"
                  target="_blank"
                  rel="noopener"
                >
                  <span class="dot">•</span>
                  <span>{{ n.title || n.newsName }}</span>
                </a>
              </div>
            </template>

            <div class="right-title">官方信息</div>
            <div class="auth-box">
              <div class="auth-row" v-if="detail.website">
                <span class="auth-label">官方网址:</span>
                <a :href="detail.website" target="_blank" rel="noopener" class="auth-val">{{ detail.website }}</a>
              </div>
              <div class="auth-row" v-if="detail.recruitWebsite">
                <span class="auth-label">招生网址:</span>
                <a :href="detail.recruitWebsite" target="_blank" rel="noopener" class="auth-val">{{ detail.recruitWebsite }}</a>
              </div>
              <div class="auth-row" v-if="detail.phone?.length">
                <span class="auth-label">官方电话:</span>
                <span class="auth-val">{{ detail.phone.join('\n') }}</span>
              </div>
              <div class="auth-row" v-if="detail.email">
                <span class="auth-label">官方邮箱:</span>
                <span class="auth-val">{{ detail.email }}</span>
              </div>
              <div class="auth-row" v-if="detail.address">
                <span class="auth-label">具体地址:</span>
                <span class="auth-val">{{ detail.address }}</span>
              </div>
            </div>
          </aside>
        </div>

        <footer class="cd-footer">
          <div class="footer-title">系统使用说明</div>
          <ol>
            <li>本查询系统数据来源于教育部官网、阳光高考、各省教育考试院、各院校官网及招生就业网等，数据仅供参考，具体数据请以学校官网或考试院最新公布为准。</li>
            <li>本站数据未经授权严禁转载，违者将依法追究责任。</li>
            <li>如对本系统或相关服务有任何疑问，可通过系统反馈渠道联系我们。</li>
          </ol>
        </footer>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  getCollegeDetail,
  getCollegeMajors,
  type CollegeDetail,
  type CollegeMajorGroup
} from '@/api/college'

const props = defineProps<{ code: number }>()

const loading = ref(false)
const majorsLoading = ref(false)
const detail = ref<CollegeDetail | null>(null)
const majorGroups = ref<CollegeMajorGroup[]>([])

const regionText = computed(() => {
  const p = (detail.value?.collegeProvince || '').trim()
  const c = (detail.value?.collegeCity || '').trim()
  if (p && c) {
    // 直辖市 city=北京市 且 province 为空或同名时只显示一侧
    if (p === c || c.startsWith(p.replace(/(省|市|自治区)$/, ''))) return c.length >= p.length ? c : p
    return `${p}${c}`
  }
  return c || p
})

const hasOtherInfo = computed(() => {
  const d = detail.value
  if (!d) return false
  return !!(d.keyLab || d.scholarship || d.accommodation || d.partnerEnterprise || d.transferMajor || d.famousAlumni)
})

function dash(v: number | null | undefined) {
  return v == null || Number.isNaN(Number(v)) ? '--' : v
}

async function load() {
  if (!props.code) return
  loading.value = true
  majorsLoading.value = true
  detail.value = null
  majorGroups.value = []
  try {
    detail.value = await getCollegeDetail(props.code)
    document.title = detail.value?.collegeName || '院校详情'
    majorGroups.value = await getCollegeMajors(props.code) || []
  } finally {
    loading.value = false
    majorsLoading.value = false
  }
}

watch(() => props.code, load)
onMounted(load)
</script>

<style scoped lang="scss">
.college-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cd-header {
  width: 100%;
  max-width: 1100px;
  position: relative;
  border: 2px solid #ededed;
  border-top: none;
  border-bottom: 1px solid #cd3532;
  min-height: 200px;
  box-sizing: border-box;
}

.header-main {
  width: 100%;
  display: flex;
  padding: 28px 0 36px;
  box-sizing: border-box;
}

.logo-box {
  width: 10%;
  min-width: 88px;
  margin: 0 2%;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 100%;
    max-width: 100px;
    object-fit: contain;
  }
  .logo-empty {
    width: 80px;
    height: 80px;
    background: #f5f5f5;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    border-radius: 4px;
  }
}

.intro-box {
  width: 86%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  min-height: 100px;
}

.line1 {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
}
.school-name {
  font-weight: 700;
  font-size: 24px;
  color: #000;
  letter-spacing: 2px;
}
.school-address {
  height: 22px;
  background: #dff5ff;
  border: 1px solid #b7edff;
  padding: 0 5px;
  font-size: 14px;
  border-radius: 4px;
  margin-left: 5px;
  display: flex;
  align-items: center;
}
.badge-shuo,
.badge-bo {
  width: 22px;
  height: 22px;
  color: #fff;
  border-radius: 50px;
  font-size: 14px;
  margin-left: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.badge-shuo { background: #be262c; }
.badge-bo { background: #fbb03b; }
.badge-bao {
  width: 22px;
  height: 22px;
  color: #fff;
  border-radius: 50px;
  font-size: 14px;
  margin-left: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #df6437;
}

.line2 {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 6px;
}
.line2-item {
  height: 18px;
  color: #cc3532;
  background: #ffdad4;
  border: 1px solid #ffb29e;
  font-size: 14px;
  border-radius: 4px;
  margin-right: 10px;
  margin-bottom: 4px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.line3 {
  margin-top: 6px;
  font-size: 14px;
  color: #303133;
  letter-spacing: 0.5px;
}

.menu-tab {
  position: absolute;
  left: 10px;
  bottom: 0;
  padding: 3px 25px 3px 7px;
  background: #cd3532;
  color: #fff;
  font-size: 18px;
  border-radius: 4px 4px 0 0;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 100%, 0 100%);
}

.cd-body {
  width: 100%;
  max-width: 1100px;
  border-width: 0 2px 2px;
  border-style: solid;
  border-color: #ededed;
  box-sizing: border-box;
  padding: 1.8%;
}

.cd-body-inner {
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 2%;
}

.cd-left {
  width: 65%;
  min-width: 380px;
}
.cd-right {
  width: 30%;
  min-width: 240px;
}

.left-title {
  display: flex;
  width: 100%;
  font-size: 18px;
  color: #606266;
  font-weight: 700;
  height: 20px;
  align-items: center;
  margin-bottom: 18px;
  letter-spacing: 1px;
  .red1 {
    display: inline-block;
    width: 2px;
    height: 100%;
    background: red;
    margin-right: 2px;
  }
  .red2 {
    display: inline-block;
    width: 5px;
    height: 100%;
    background: red;
    margin-right: 5px;
  }
}

.grey-box {
  padding: 12px 10px;
  background: #f7f7f7;
  border-radius: 10px;
  width: 100%;
  margin-bottom: 18px;
  box-sizing: border-box;
}
.grey-text {
  width: 100%;
  text-align: justify;
  font-size: 14px;
  letter-spacing: 0.6px;
  text-indent: 2em;
  color: #606266;
  line-height: 25px;
  white-space: pre-wrap;
  word-break: break-word;
  &.no-indent { text-indent: 0; }
  &.empty { text-indent: 0; color: #909399; }
}
.learn-more {
  text-align: right;
  margin-top: 6px;
  a {
    color: #c83734;
    text-decoration: none;
    font-size: 14px;
    &:hover { color: #f56c6c; }
  }
}

.icon-row {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.icon-item {
  width: 70px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 70px;
}
.icon {
  width: 100%;
  height: 73%;
  display: flex;
  justify-content: center;
  align-items: center;
  img { width: 100%; }
}
.ratio-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #be262c, #409eff);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
}
.icon-text {
  margin-top: 4px;
  font-size: 14px;
  color: #606266;
  text-align: center;
}

.major-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #606266;
  th, td {
    border: 1px solid #c7ccd4;
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #f0f0f0;
    font-weight: 600;
    text-align: center;
  }
  td:first-child { text-align: center; white-space: nowrap; }
  &.grad-table {
    font-size: 13px;
    th, td { text-align: center; white-space: nowrap; padding: 6px 4px; }
  }
  .level-cell {
    font-weight: 700;
    color: #cd3532;
  }
}

.rank-box {
  background: #f7f7f7;
  margin-bottom: 8px;
}
.rank-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: #606266;
  th, td {
    border: 1px solid #c7ccd4;
    padding: 8px 6px;
    text-align: center;
  }
  th { background: #f0f0f0; }
  .rank-num { font-weight: 700; color: #cd3532; }
}
.news-box {
  background: #f7f7f7;
  padding: 8px 10px 12px;
  margin-bottom: 20px;
  max-height: 280px;
  overflow: auto;
}
.news-item {
  display: flex;
  gap: 6px;
  color: #606266;
  text-decoration: none;
  font-size: 13px;
  line-height: 1.6;
  padding: 4px 0;
  &:hover { color: #cd3532; }
  .dot { color: #cd3532; flex-shrink: 0; }
}

.other-info .other-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
  gap: 10px;
}
.other-tag {
  width: 105px;
  flex-shrink: 0;
  justify-content: center;
  --el-tag-bg-color: #d8716c;
  --el-tag-text-color: #fff;
  --el-tag-border-color: #d8716c;
}
.other-text {
  flex: 1;
  color: #606266;
  font-size: 14px;
  line-height: 22px;
  text-align: justify;
  word-break: break-word;
}

.right-title {
  width: 100%;
  height: 38px;
  background: #cd3532;
  color: #fff;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 7.5px;
  text-indent: 8px;
}

.vr-box {
  width: 100%;
  height: 160px;
  background: #f7f7f7;
  margin-bottom: 20px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.vr-link {
  display: block;
  width: 100%;
  height: 100%;
  text-decoration: none;
}
.vr-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}

.auth-box {
  background: #f7f7f7;
  padding: 10px 12px;
  margin-bottom: 20px;
}
.auth-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.5;
}
.auth-label {
  flex-shrink: 0;
  width: 70px;
  color: #303133;
  font-weight: 600;
}
.auth-val {
  flex: 1;
  color: #606266;
  word-break: break-all;
  white-space: pre-line;
  text-decoration: none;
}
a.auth-val { color: #409eff; }

.cd-footer {
  width: 100%;
  min-height: 140px;
  background: #fdf3f4;
  padding: 16px 20px;
  box-sizing: border-box;
  margin-top: 8px;
  color: #606266;
  font-size: 13px;
  line-height: 1.7;
  .footer-title {
    font-weight: 700;
    margin-bottom: 8px;
    color: #303133;
  }
  ol {
    margin: 0;
    padding-left: 1.4em;
  }
}

@media (max-width: 900px) {
  .cd-body-inner { flex-direction: column; }
  .cd-left, .cd-right { width: 100%; min-width: 0; }
  .icon-item { margin-right: 28px; }
}
</style>
